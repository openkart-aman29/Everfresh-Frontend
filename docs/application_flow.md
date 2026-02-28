# Application Flow and Roles

This document outlines the user flow and roles and responsibilities within the EverFresh Admin Dashboard.

## Application Roles

The platform defines three primary roles: `SUPER_ADMIN`, `ADMIN`, and `STAFF`. Access control is tightly enforced via the `RoleGuard` component in the frontend router.

### 1. Super Admin
**Responsibilities:**
- Top-level management of the system.
- Has the unique ability to onboard and manage different Companies using the platform.
- Can create and manage other Admins globally.

**Application Flow:**
1. **Login:** Accesses the system.
2. **Landing:** Default view is typically the Companies management page (`/app/companies`).
3. **Actions:**
   - **Company Management:** Create new companies (`/app/companies/create`), view company specifics (`/app/companies/:companyId`), edit company details (`/app/companies/:companyId/edit`).
   - **Admin Management:** Create Admins (`/app/admin/create`), update Admins (`/app/admin/:adminId`), view Admins list (`/app/admin`).

### 2. Admin
**Responsibilities:**
- Operates within the specific scope of the company they are assigned to.
- Manages Staff assigned to their company.
- Manages Bookings and schedules.

**Application Flow:**
1. **Login:** Inherits permissions bound to their specific `company_id`.
2. **Landing:** Defaults to a Dashboard (`/app/dashboard`) showing business metrics.
3. **Actions:**
   - **Metrics:** Review revenue, confirmed/pending bookings, active agents.
   - **Staff Management:** View all staff (`/app/staff`), onboard new staff members (`/app/staff/create`), view/edit specific staff (`/app/staff/:staffId`).
   - **Scheduling:** Manage jobs via the Scheduler page (`/app/scheduler`).

### 3. Staff
**Responsibilities:**
- Performs the actual service provisions (e.g., cleaning, moving).
- Has restricted access to the system focused purely on their own profile and task execution.

**Application Flow:**
1. **Login:** Focused on operational data.
2. **Landing:** Defaults to their personal profile or a specific schedule view.
3. **Actions:**
   - **Profile Management:** Can view their details (`/app/staff/:staffId`) and edit standard profiling data (`/app/staff/:staffId/edit`).
   - Their view is vastly limited and is entirely blocked from high-level management tools, dashboards, or company data.

## Access Enforcement Summary
- The `MainRouter.tsx` defines which component renders based on the arrays passed to the `RoleGuard` wrapper (`allowedRoles={[ROLES.ADMIN]}`).
- Missing or differing roles force a redirection to a generic fallback or an unauthorized page.
