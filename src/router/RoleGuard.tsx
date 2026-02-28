import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/useStoreHook'
import { ROUTES } from '@/lib/constants'
import { ROLES } from '@/config/permissions'

interface RoleGuardProps {
    allowedRoles: string[]
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
    const { user } = useAppSelector((state) => state.staffAuth)

    if (!user) {
        return <Navigate to={ROUTES.SIGNIN} replace />
    }

    const hasPermission = user.roles.some((role) => allowedRoles.includes(role))

    if (!hasPermission) {
        // Redirect logic for unauthorized access
        if (user.roles.includes(ROLES.STAFF) && user.domain_id) {
            // Staff can only see their own profile, so if they try to access something else, send them there.
            return <Navigate to={`/app/staff/${user.domain_id}`} replace />
        }

        if (user.roles.includes(ROLES.SUPER_ADMIN)) {
            return <Navigate to="/app/companies" replace />
        }

        // Admins who somehow land on a forbidden page (e.g. Admin trying to access Super Admin page)
        // should go to dashboard
        return <Navigate to={ROUTES.DASHBOARD} replace />
    }

    return <Outlet />
}
