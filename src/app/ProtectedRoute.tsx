import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/useStoreHook'
import { ROUTES } from '@/lib/constants'

export default function ProtectedRoute() {
    const { isAuthenticated } = useAppSelector(state => state.staffAuth)

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.SIGNIN} replace />
    }

    return <Outlet />
}
