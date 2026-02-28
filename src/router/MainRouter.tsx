import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from '@/app/App'
import { ROUTES } from '@/lib/constants'
import { ROLES } from '@/config/permissions'
import RedirectIfAuthenticated from '@/app/RedirectIfAuthenticated'
import ProtectedRoute from '@/app/ProtectedRoute'
import RoleGuard from '@/router/RoleGuard'
import AdminLayout from '@/components/layout/AdminLayout'
import PublicLayout from '@/components/layout/PublicLayout'

// Lazy Load Pages
const SignInPage = lazy(() => import('@/features/auth/staff/operations/sign_in/pages/SignInPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/staff/operations/forgot_password/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/staff/operations/reset_password/pages/ResetPasswordPage'))
const HomePage = lazy(() => import('@/features/public/pages/HomePage'))
const AboutPage = lazy(() => import('@/features/public/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage'))
const DashboardPage = lazy(() => import('@/features/core/dashboard/operations/view/pages/DashboardPage'))
const StaffDetailsPage = lazy(() => import('@/features/core/staff/operations/view/pages/StaffDetailsPage'))
const CreateStaffPage = lazy(() => import('@/features/core/staff/operations/create/pages/CreateStaffPage'))
const UpdateStaffPage = lazy(() => import('@/features/core/staff/operations/update/pages/UpdateStaffPage'))
const StaffProfileRedirect = lazy(() => import('@/features/core/staff/operations/view/pages/StaffProfileRedirect'))
const SchedulerPage = lazy(() => import('@/features/core/scheduler/operations/view/pages/SchedulerPage'))
const AdminPage = lazy(() => import('@/features/core/admin/operations/view/pages/AdminPage'))
const CreateAdminPage = lazy(() => import('@/features/core/admin/operations/create/pages/CreateAdminPage'))
const UpdateAdminPage = lazy(() => import('@/features/core/admin/operations/update/pages/UpdateAdminPage'))
const CompaniesPage = lazy(() => import('@/features/core/companies/operations/view/pages/CompaniesPage'))
const CreateCompanyPage = lazy(() => import('@/features/core/companies/operations/create/pages/CreateCompanyPage'))
const CompanyDetailsPage = lazy(() => import('@/features/core/companies/operations/view/pages/CompanyDetailsPage'))
const EditCompanyPage = lazy(() => import('@/features/core/companies/operations/update/pages/EditCompanyPage'))

// Simple Loading Fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
)

export const MainRouter = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<App />}>
                        {/* Public Routes with Layout */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                        </Route>

                        {/* Auth Routes */}
                        <Route element={<RedirectIfAuthenticated />}>
                            <Route path={ROUTES.SIGNIN} element={<SignInPage />} />
                            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                        </Route>

                        {/* Protected Admin Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<AdminLayout />}>
                                {/* Super Admin Only */}
                                <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />}>
                                    <Route path={ROUTES.ADMIN} element={<AdminPage />} />
                                    <Route path="/app/admin/create" element={<CreateAdminPage />} />
                                    <Route path="/app/admin/:adminId" element={<UpdateAdminPage />} />
                                    <Route path="/app/companies" element={<CompaniesPage />} />
                                    <Route path="/app/companies/create" element={<CreateCompanyPage />} />
                                    <Route path="/app/companies/:companyId" element={<CompanyDetailsPage />} />
                                    <Route path="/app/companies/:companyId/edit" element={<EditCompanyPage />} />
                                </Route>

                                {/* Admin Only - Operational Access */}
                                <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
                                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                                    <Route path="/app/scheduler" element={<SchedulerPage />} />
                                    {/* Staff Management - View All */}
                                    <Route path="/app/staff" element={<StaffProfileRedirect />} />
                                    <Route path="/app/staff/create" element={<CreateStaffPage />} />
                                </Route>

                                {/* Shared Access (Staff, Admin) */}
                                <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.STAFF]} />}>
                                    <Route path="/app/staff/:staffId" element={<StaffDetailsPage />} />
                                    <Route path="/app/staff/:staffId/edit" element={<UpdateStaffPage />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>

                </Routes>
            </Suspense>
        </BrowserRouter >
    )
}
