# RTK Query & API Endpoints Documentation

This document describes the implementation of Redux Toolkit (RTK) Query used to synchronize the frontend with the backend APIs.

## RTK Query Structure
All APIs are generated using `createApi` from `@reduxjs/toolkit/query/react`. 
- **`baseQuery`**: Wraps the network call using `baseQueryWithReauth`. This guarantees automatic handling of expired access tokens by seamlessly executing a token rotation mutation.
- **Tags**: APIs employ strict `PROVIDES` and `INVALIDATES` strategies (e.g., `tagTypes: ['Company', 'Admin', 'Staff']`). This ensures cache coherence immediately upon creating, mutating, or destroying a record.

---

## Defined API Services

### 1. Staff Authentication (`staffAuthApi`)
Handles all authentication routines relative to Staff/Admin identities.

| Endpoint | Method | Path | Use / Role |
| :--- | :--- | :--- | :--- |
| `signIn` | POST | `/auth/signin/staff` | Authenticates User. Returns accessToken and user entity. |
| `signup` | POST | `/auth/signup/staff` | Registers a new staff member. |
| `signOut` | POST | `/auth/signout/staff` | Signs out user, clearing HTTP-only refresh tokens. |
| `rotateToken` | POST | `/auth/refresh-token` | Internal utility wrapped by `baseQueryWithReauth` to refresh session. |
| `forgotPassword` | POST | `/auth/forgot-password` | Initiates the forgot password flow via Email. |
| `resetPassword` | POST | `/auth/reset-password` | Resets the user's password using the token sent to their Email. |

### 2. Company API (`companyApi`)
Managed mainly by `SUPER_ADMIN` to configure tenant entities.

| Endpoint | Method | Path | Use / Role |
| :--- | :--- | :--- | :--- |
| `createCompany` | POST | `/companies/create` | (`SUPER_ADMIN`) Provisions a new company on the platform. |
| `readAllCompanies` | GET | `/companies/read-all` | Lists all active and inactive companies with pagination. |
| `readCompany` | GET | `/companies/read/:companyId` | Gets verbose details including `dashboard_metrics` of a specific company. |
| `updateCompany` | PATCH | `/companies/update/:companyId` | Alters parameters like subscription tier, logo, or activation status. |

### 3. Admin API (`adminApi`)
Allows management of high-level operators representing the companies.

| Endpoint | Method | Path | Use / Role |
| :--- | :--- | :--- | :--- |
| `createAdmin` | POST | `/auth/signup/admin` | Provisions a new Administrator under a specific company. |
| `readAllAdmins` | GET | `/admin/read-all` | Lists Admins, optionally filtered by `company_id`. |
| `readAdmin` | GET | `/admin/read/:adminId` | Gets the distinct payload for a single Admin user. |
| `updateAdmin` | PUT | `/admin/update/:adminId` | Alters parameters of an existing Administrator. |

### 4. Staff Management API (`staffManagementApi`)
Provides operations to interface with the `Staff` workforce.

| Endpoint | Method | Path | Use / Role |
| :--- | :--- | :--- | :--- |
| `readAllStaff` | GET | `/staff/read-all` | Lists Staff members (Admins default to their Company logic) + basic telemetry. |
| `readStaff` | GET | `/staff/read/:staffId` | Retrieves a staff member's complete profile, including `work_metrics` and `next_confirmed_booking`. |
| `updateStaff` | PATCH | `/staff/update/:staffId` | Adjusts staff attributes (e.g. skills, availability status). |

### 5. Bookings API (`bookingsApi`)
Interfaces that operators use to manage operational workload.

| Endpoint | Method | Path | Use / Role |
| :--- | :--- | :--- | :--- |
| `readAllBookings` | GET | `bookings/read-all` | Pulls job list for the scheduler calendar. Includes pagination configuration. |
| `rescheduleBooking` | POST | `bookings/reschedule/:booking_id` | Changes datetime markers of a given booking. Invalidates bookings calendar to update the user interface immediately. |
