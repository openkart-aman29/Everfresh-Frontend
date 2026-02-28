# Architecture & Optimization

## 1. Project Architecture

The EverFresh Admin Dashboard follows a feature-based architecture. This means the codebase is divided into directories based on business domains rather than purely technical roles (like `components`, `hooks`, `utils`).

### 1.1 Folder Structure
- **`src/features/`**: The core of the application. It contains subdirectories for different domains (e.g., `auth`, `core`, `api`, `global`, `public`). Inside each feature, you'll find related components, operations, APIs, schemas, and interfaces.
- **`src/store/`**: Configuration for Redux toolkit. Contains the central `Store.ts`, custom middleware (like error handling), and persistence setup (`redux-persist`).
- **`src/router/`**: Centralized routing utilizing `react-router-dom`. Routes are grouped by layout and protected by `RoleGuard` based on user roles.
- **`src/api/`**: Base setup for RTK Query, including the `baseQuery` configuration that handles token adding and re-authentication (token rotation).
- **`src/components/`**: Reusable, generic UI components (e.g., buttons, inputs, layouts) that are not tied to specific business logic.
- **`src/lib/`**: Generic utilities and constants.

### 1.2 State Management
State is managed using Redux Toolkit (RTK).
- **Redux Slices**: Used for persistent state like authentication details (`StaffAuthSlice`).
- **Redux-Persist**: Used to save specific slices (e.g., `staffAuth`) to local storage, ensuring user sessions remain active across browser reloads.
- **RTK Query**: Used exclusively for all asynchronous data fetching, caching, and state synchronization with the backend.

## 2. Optimization Techniques

- **Feature-based Splitting**: Keeps related code together, making it easier to maintain and enabling localized state or components specific to a single domain.
- **RTK Query Caching**: Eliminates redundant network requests by using `tagTypes` (e.g., `['Company', 'Admin', 'Staff']`). Mutations automatically invalidate tags, trigerring refetches only when data changes.
- **Code Splitting & Lazy Loading**: Using `React.Suspense` in the router (`MainRouter.tsx`) ensures that pages and large chunks are loaded only when navigated to, reducing the initial bundle size.
- **Role-Based Guards**: React components are not even rendered for unauthorized roles thanks to early exits in `RoleGuard.tsx`, optimizing both security and rendering cycles.
- **Debouncing**: Handled at the base utility level for search inputs to prevent overwhelming the API on quick keystrokes.

## 3. Error Handling

### 3.1 Global Error Handling
A global error middleware (`rtkQueryErrorLogger` in `src/store/middleware/errorMiddleware.ts`) intercepts rejected RTK Query actions.
- Any API errors are dispatched to a `GlobalErrorSlice` and can be presented globally (e.g., using a toastification library).
- Unhandled Promise rejections and network errors are caught and transformed into user-friendly messages.

### 3.2 Form Validation (Zod)
All forms utilize `react-hook-form` coupled with `zod` for rigid schema validation. This ensures:
- Data integrity before submission.
- Instant, inline, localized feedback to the user on validation failures.

### 3.3 Re-Authentication
If the backend throws a 401 (Unauthorized) due to an expired token, the `baseQueryWithReauth` function automatically attempts to rotate the token utilizing the `staffAuthApi.rotateToken` endpoint.
- If successful, the original blocked request is re-triggered automatically.
- If it fails, the user is forcefully logged out and redirected to the login page entirely wiping the persisted local storage.
