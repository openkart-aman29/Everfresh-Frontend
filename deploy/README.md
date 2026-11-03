# Deploying the admin panel

## Why a separate API hostname is safe here

The panel is served at `admin.everfresh.ae/` as **static files only**. nginx
proxies nothing: the panel calls `https://api.everfresh.ae/api/v1` directly,
cross-origin.

That normally would not be safe. The panel keeps its refresh token in an
`httpOnly` cookie and sends every request with `credentials: 'include'`, and a
cookie on a *third-party* site is blocked outright by Safari and is being phased
out by Chrome — sign-in would work on some desktops and fail silently on every
iPhone.

These two hostnames are not third-party to each other. Browsers decide that by
**registrable domain**, and `admin.everfresh.ae` and `api.everfresh.ae` both
reduce to `everfresh.ae`. The request is same-site, merely cross-origin. The
cookie stays first-party, no browser blocks it, and `SameSite=Lax` is enough.

Cross-origin does mean CORS applies, which is the part that bites — see
**Backend prerequisites** below. Both failures there are silent.

Consequence: `VITE_API_BASE_URL` must be the **absolute** `https` URL.
`deploy.sh` fails the build if it is missing or if any other API base reaches
the bundle. A relative `/api/v1` would resolve against `admin.everfresh.ae`,
match no file, and fall through nginx's SPA rewrite — so every API call would
come back as `index.html` with a `200`, which the app reads as a logged-out
session, with nothing in the console to explain it.

## The boxes

| | |
|---|---|
| Panel + nginx | Proxmox `ap10u30`, LXC **100** `ubuntu-ct`, `10.10.0.10` — nginx 1.18.0, node v20.19.6 |
| API | Windows/IIS box, `83.142.27.116`, `api.everfresh.ae` — IIS + ARR 3.0 → PM2 `everfresh-admin` on `127.0.0.1:5000` |
| Database | LXC **101** `db-ct`, reached from the IIS box via DNAT on the Proxmox host |

LXC **102** `Web2` used to run the API at `10.10.0.30:5000`. It does not any
more. Only one instance runs anywhere, and that is deliberate: `SSE_Manager`
holds its connected clients in an in-memory array, so a second instance would
broadcast only to its own clients and live updates would work "sometimes".

Two things follow from the versions on LXC 100:

- **nginx 1.18** has no `http2 on;` directive. The vhost deliberately omits
  HTTP/2 altogether: in 1.18 `http2` is a listening-socket option, so setting
  it here would enable it for all seventeen other sites sharing `:443`.
- **node v20.19.6** clears Vite 7's floor (`^20.19.0 || >=22.12.0`) by one
  patch release. Do not downgrade node on that container.

## Layout on the server

```
/var/www/everfresh-admin-ui/
  repo/                      this clone
  releases/20261103-153000/  a built dist
  live -> releases/...       what nginx serves  (nginx root)
```

nginx's `root` is the `live` symlink, never a build directory. Vite empties its
output directory before writing, so building into the served path would serve
404s for the length of every build. `deploy.sh` builds a new release, checks
it, then moves the symlink once.

## Backend prerequisites

Do these **before** the panel goes live. Both fail without an error anywhere —
the panel just behaves as if nobody is signed in.

On the IIS box, in the backend's `envs/.env`:

```ini
# Was `everfresh`, which is not a domain at all. A browser on
# api.everfresh.ae rejects a cookie whose Domain is not a suffix of the host,
# so the refresh cookie was never being stored. The leading dot covers every
# subdomain, which is what lets the panel on admin.everfresh.ae use a cookie
# the API set on api.everfresh.ae.
COOKIE_DOMAIN=.everfresh.ae

# Exact scheme. An https Origin never matches an http:// entry, and `cors`
# simply omits the allow header rather than erroring - so the API logs a
# healthy 200 while the browser discards the response.
ALLOWED_ORIGINS=https://admin.everfresh.ae, https://www.everfresh.ae, http://localhost:5173, http://localhost:3024

# Lax is enough now, and safer than none: the panel and the API are same-site.
REFRESH_TOKEN_COOKIE_SAME_SITE=lax
REFRESH_TOKEN_COOKIE_SECURE=true
```

Then `pm2 restart everfresh-admin --update-env`.

In IIS Manager, at the **server** node → *Application Request Routing Cache* →
*Server Proxy Settings*: set **Response buffer threshold** to `0`. ARR buffers
responses by default, which never completes an SSE stream — the panel's live
feed would simply never deliver an event. Nothing logs this.

## First-time setup

On LXC 100, as root. Order matters: build *before* swapping the vhost, because
the vhost being replaced is what currently proxies this hostname to the old API
on LXC 102, so the smoke tests would fail against a build that is fine.

```sh
# 1. Clone. You do the git; deploy.sh never fetches, pulls or checks out.
mkdir -p /var/www/everfresh-admin-ui
git clone <repo-url> /var/www/everfresh-admin-ui/repo

# 2. Build and publish the first release.
cd /var/www/everfresh-admin-ui/repo
./scripts/deploy.sh --no-smoke

# 3. Keep the vhost you are replacing. This is the rollback path.
cp /etc/nginx/sites-available/admin.everfresh.ae \
   /etc/nginx/sites-available/admin.everfresh.ae.bak-$(date -u +%Y%m%d)

# 4. Swap it in.
cp deploy/nginx/admin.everfresh.ae.conf \
   /etc/nginx/sites-available/admin.everfresh.ae
nginx -t && systemctl reload nginx

# 5. Verify, now that the vhost serves the panel.
./scripts/deploy.sh
```

If step 4's `nginx -t` fails, nothing has changed yet — `systemctl reload` only
runs on success. Restore with:

```sh
cp /etc/nginx/sites-available/admin.everfresh.ae.bak-* \
   /etc/nginx/sites-available/admin.everfresh.ae
nginx -t && systemctl reload nginx
```

### What the new vhost keeps, and what it drops

The vhost it replaces was Certbot-generated and proxied **everything** to
`10.10.0.30:5000`. The API has moved off that box entirely, so the proxying is
gone — no `upstream`, no `location /api/`, no `proxy_pass`.

Kept on purpose:

- both server names, `admin.everfresh.ae` and `www.admin.everfresh.ae`
- the port-80 block, byte-for-byte as Certbot wrote it. Renewal uses the nginx
  plugin, which edits the running config rather than serving a webroot
  challenge, so editing that block risks breaking renewal.
- an exact-match `/health`, but now a `301` to `api.everfresh.ae/health`
  instead of a proxy. This hostname was the API's only public address for a
  long time and an uptime monitor may still be pointed at it. Without the
  block the request would fall through `try_files` and get the SPA shell with a
  `200`: permanently green, permanently wrong. Delete it once nothing points
  here.

Added:

- `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`. helmet
  set these on API responses, and the API is no longer served from this host,
  so nothing would set them on the panel's own HTML. `DENY` rather than
  `SAMEORIGIN` because nothing legitimately frames an admin panel, and framing
  it is the whole clickjacking attack.

The certificate at `/etc/letsencrypt/live/admin.everfresh.ae/` already covers
this hostname. No new certbot run is needed.

## Routine deploy

```sh
cd /var/www/everfresh-admin-ui/repo
git pull                        # you, by hand
./scripts/deploy.sh
```

It refuses a dirty tree, builds into a new release, verifies the bundle carries
the right API base, swaps the symlink, then checks through the real vhost that
the shell loads, a deep link falls through, `/api/` is *not* served here, the
API answers, and the API allows this origin with credentials.

Rollback is a symlink move, not a rebuild:

```sh
./scripts/deploy.sh --rollback
```
