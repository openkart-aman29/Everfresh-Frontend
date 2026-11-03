#!/usr/bin/env bash
#
# Deploy the Everfresh admin panel (static SPA) on the proxy box, LXC 100.
#
# This script does not touch git. It deploys whatever is checked out, and
# refuses to run on a dirty tree so that the SHA it reports is the SHA it
# shipped. Pull or merge first, by hand, then run this.
#
# Layout it expects and maintains:
#
#   /var/www/everfresh-admin-ui/
#     repo/                     this clone  (you manage it with git)
#     releases/20261102-1530/   a built dist
#     live -> releases/...      what nginx serves
#
# The release directory plus symlink is not ceremony. Vite empties its output
# directory before writing, so building straight into the served path means
# every deploy serves 404s for the length of the build. Moving one symlink
# after the build has been checked makes the switch atomic and makes rollback
# a second symlink move rather than a rebuild.
#
# Usage:  ./scripts/deploy.sh
#         ./scripts/deploy.sh --rollback      (previous release)
#         ./scripts/deploy.sh --no-smoke      (first run, before the vhost swap)

set -euo pipefail

BASE_DIR="/var/www/everfresh-admin-ui"
APP_DIR="$BASE_DIR/repo"
RELEASES_DIR="$BASE_DIR/releases"
LIVE_LINK="$BASE_DIR/live"
VHOST="admin.everfresh.ae"
API_ORIGIN="https://api.everfresh.ae"   # the panel calls this directly; nothing proxies it here
MIN_FREE_MB=1200
KEEP_RELEASES=4

say() { echo ">>> $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

# --- Arguments -------------------------------------------------------------
# --no-smoke exists for exactly one situation: the very first deploy. The
# checks at the end request the panel through the live vhost, and until that
# vhost has been swapped this hostname still proxies everything to the API, so
# they would fail on a build that is perfectly fine. Build once with the flag,
# swap the vhost, then run again without it to verify.
SKIP_SMOKE=0
case "${1:-}" in
    --rollback) ;;
    --no-smoke) SKIP_SMOKE=1 ;;
    "")         ;;
    *)          die "Unknown option: $1  (expected --rollback or --no-smoke)" ;;
esac


# --- Rollback --------------------------------------------------------------
if [[ "${1:-}" == "--rollback" ]]; then
    CURRENT="$(readlink -f "$LIVE_LINK" 2>/dev/null || true)"
    PREVIOUS="$(ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null \
                 | grep -v "^${CURRENT%/}/\?$" | head -1 || true)"
    [[ -n "$PREVIOUS" ]] || die "No earlier release in $RELEASES_DIR to roll back to."
    ln -sfn "${PREVIOUS%/}" "$LIVE_LINK"
    say "Rolled back to $(basename "${PREVIOUS%/}")"
    exit 0
fi

echo "=== Everfresh admin panel deploy: $(date -u) ==="

# --- Preflight -------------------------------------------------------------
command -v node >/dev/null || die "node not found"
command -v npm  >/dev/null || die "npm not found"
command -v nginx >/dev/null || die "nginx not found - is this the right container?"

[[ -d "$APP_DIR" ]] || die "APP_DIR not found: $APP_DIR"
cd "$APP_DIR"

[[ -f package.json ]] || die "No package.json in $APP_DIR"
mkdir -p "$RELEASES_DIR"

FREE_MB=$(df -Pm . | awk 'NR==2{print $4}')
if (( FREE_MB < MIN_FREE_MB )); then
    die "Only ${FREE_MB}MB free, need ${MIN_FREE_MB}MB. Try: npm cache clean --force"
fi
say "Disk check passed (${FREE_MB}MB free)"

# Read-only: this script never fetches, pulls or checks out. A dirty tree
# would mean the reported SHA is not what gets built.
if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    die "Working tree has local changes. Commit, stash or discard them, then re-run."
fi
say "Deploying $(git rev-parse --short HEAD) on $(git rev-parse --abbrev-ref HEAD)"

# --- Build -----------------------------------------------------------------
# Vite bakes every VITE_* value into the bundle, so the env file must be
# present *before* the build; there is no restart that can fix it afterwards.
[[ -f .env.production ]] || die ".env.production is missing. It is tracked - is this clone complete?"

say "Installing dependencies"
npm ci --no-audit --no-fund || npm install --no-audit --no-fund

RELEASE="$RELEASES_DIR/$(date -u +%Y%m%d-%H%M%S)"
say "Building into $RELEASE"
npx tsc -b
npx vite build --mode production --outDir "$RELEASE" --emptyOutDir

# --- Verify the artefact ---------------------------------------------------
[[ -f "$RELEASE/index.html" ]] || die "Build produced no index.html"
ASSETS=$(ls -1 "$RELEASE/assets/" 2>/dev/null | wc -l)
(( ASSETS > 0 )) || die "Build produced no assets"

# The check that earns its place. .env.production once pointed at
# https://api.everfresh.com, a domain that does not resolve, and because the
# value is compiled in there is nothing at runtime that reports it - the panel
# just fails every request. Catch it here, in the artefact, before it ships.
#
# This check was INVERTED when the API moved to its own hostname. It used to
# demand a relative base, because nginx proxied /api/ on this host. Nothing is
# proxied here any more, so a relative base now resolves against
# admin.everfresh.ae, matches no file, and falls through the SPA rewrite - the
# panel would get index.html with a 200 for every API call and read that as a
# logged-out session, with nothing in the console to explain it.
EXPECTED_API="$API_ORIGIN/api/v1"

grep -rqF "$EXPECTED_API" "$RELEASE/assets/" || {
    echo "API bases found in the bundle:" >&2
    grep -rhoE 'https?://[a-z0-9.:-]+/api/v[0-9]+' "$RELEASE/assets/" | sort -u >&2
    echo "  (nothing listed means a relative base, which leaves no absolute URL)" >&2
    rm -rf "$RELEASE"
    die "The bundle does not contain $EXPECTED_API.
       Check VITE_API_BASE_URL in .env.production. A missing env file fails the
       same way: constants.ts falls back to a relative /api/v1."
}

# A second absolute base alongside the right one means a URL was hardcoded in
# source, or a stale value survived the build.
STRAY=$(grep -rhoE 'https?://[a-z0-9.:-]+/api/v[0-9]+' "$RELEASE/assets/" |
        sort -u | grep -vxF "$EXPECTED_API" || true)
if [[ -n "$STRAY" ]]; then
    echo "$STRAY" >&2
    rm -rf "$RELEASE"
    die "The bundle carries an API base other than $EXPECTED_API (listed above).
       Grep the source for a hardcoded URL."
fi
say "Build OK (${ASSETS} assets, API base $EXPECTED_API)"

# --- Go live ---------------------------------------------------------------
PREVIOUS="$(readlink -f "$LIVE_LINK" 2>/dev/null || true)"
ln -sfn "$RELEASE" "$LIVE_LINK"
say "live -> $(basename "$RELEASE")"

# Static files need no reload, but a vhost that fails to parse would have been
# broken since the last edit and this is the moment to find out.
nginx -t 2>&1 | sed 's/^/    /'

# --- Smoke test ------------------------------------------------------------
# --resolve pins the hostname to this box, so the tests exercise the real
# vhost, TLS and proxy rules without depending on public DNS or routing.
if (( SKIP_SMOKE )); then
    say "Smoke tests skipped (--no-smoke). Swap the vhost, then re-run without it."
else
    say "Checking the panel loads"
    curl -fsS --resolve "$VHOST:443:127.0.0.1" "https://$VHOST/" | grep -q 'id="root"' \
        || die "The panel did not serve its shell. Roll back: $0 --rollback"

    say "Checking a deep link falls through to the SPA"
    curl -fsS -o /dev/null --resolve "$VHOST:443:127.0.0.1" "https://$VHOST/app/dashboard" \
        || die "Deep link 404ed - try_files is missing from the vhost."

    say "Checking the panel does NOT serve the API"
    # Nothing proxies /api/ on this host now. The point of this check is that
    # the failure is invisible otherwise: the request falls through try_files
    # and comes back as the SPA shell with a 200, so curl -f calls it a
    # success. Assert on the body, not the status.
    if curl -fsS --resolve "$VHOST:443:127.0.0.1" "https://$VHOST/api/v1/health" \
         | grep -q '"state"'; then
        die "This vhost is still proxying /api/ to a backend. Install the static-only
       vhost from deploy/nginx/ before deploying."
    fi

    say "Checking the API the bundle points at is reachable"
    curl -fsS "$EXPECTED_API/health" | head -c 200; echo

    # The check that catches the one setting nobody remembers. The panel calls
    # the API cross-origin, so every request needs this exact origin on the
    # backend's ALLOWED_ORIGINS - and the committed default lists the http://
    # form, which never matches an https Origin. Without it the browser drops
    # every response and the panel looks frozen with no server-side error.
    say "Checking the API allows this origin with credentials"
    CORS=$(curl -fsS -o /dev/null -D - -X OPTIONS "$EXPECTED_API/auth/signin" \
             -H "Origin: https://$VHOST" \
             -H "Access-Control-Request-Method: POST" \
             -H "Access-Control-Request-Headers: content-type" \
             | tr -d '\r')

    grep -qix "access-control-allow-origin: https://$VHOST" <<<"$CORS" \
        || die "The API did not echo https://$VHOST as an allowed origin.
       Add it to ALLOWED_ORIGINS in the backend's envs/.env, with https://, and
       restart the API. Headers returned:
$CORS"

    grep -qix 'access-control-allow-credentials: true' <<<"$CORS" \
        || die "The API allows this origin but not credentials, so the refresh
       cookie will never be sent. Check cors({ credentials: true }) on the API."

    say "Checking the stale /health redirects to the API"
    curl -fsS -o /dev/null -w '    /health -> %{redirect_url}\n' \
        --resolve "$VHOST:443:127.0.0.1" "https://$VHOST/health"
fi

if [[ -n "$PREVIOUS" ]]; then
    echo "    (previous release was $(basename "$PREVIOUS") - $0 --rollback)"
fi

# --- Tidy ------------------------------------------------------------------
say "Keeping the last ${KEEP_RELEASES} releases"
ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null | tail -n +$((KEEP_RELEASES+1)) | xargs -r rm -rf

echo "=== Deploy completed: $(date -u) ==="
