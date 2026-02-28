import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/useStoreHook'
import { ROUTES } from '@/lib/constants'

export default function RedirectIfAuthenticated() {
    const { isAuthenticated, user } = useAppSelector(state => state.staffAuth)

    if (isAuthenticated && user) {
        if (user.roles.includes('super_admin')) {
            return <Navigate to="/app/companies" replace />
        }
        if (user.roles.includes('staff') && user.domain_id) {
            return <Navigate to={`/app/staff/${user.domain_id}`} replace />
        }
        return <Navigate to={ROUTES.DASHBOARD} replace />
    }

    return <Outlet />
}
