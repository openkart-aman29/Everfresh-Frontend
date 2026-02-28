import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/useStoreHook'
import { ROUTES } from '@/lib/constants'
import { AdminProfileView } from '@/features/core/admin/operations/view/components/AdminProfileView'
import { ROLES } from '@/config/permissions'
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from 'lucide-react'

export default function StaffProfileRedirect() {
    const { user } = useAppSelector((state) => state.staffAuth)

    if (!user) {
        return <Navigate to={ROUTES.SIGNIN} replace />
    }

    // Check for Admin role
    const isAdmin = user.roles.includes(ROLES.ADMIN) || user.roles.includes(ROLES.SUPER_ADMIN)

    if (isAdmin) {
        // If we have domain_id, show the profile
        if (user.domain_id) {
            return <AdminProfileView adminId={user.domain_id} />
        }

        // Critical Error: Admin logged in but no domain_id (Admin Profile ID) found in state.
        // This usually happens if the backend didn't return the admin_id/domain_id during login.
        return (
            <div className="flex items-center justify-center h-[60vh] p-6">
                <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Profile Not Found</h3>
                            <p className="text-sm text-muted-foreground">
                                Your account is detected as an Administrator, but no Admin Profile ID was found associated with your session.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Please try signing out and signing in again. If the issue persists, contact support.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // If Staff, redirect to their own profile using domain_id (which maps to staff_id)
    if (user.roles.includes(ROLES.STAFF) && user.domain_id) {
        return <Navigate to={`/app/staff/${user.domain_id}`} replace />
    }

    // Fallback if no specific role match or missing domain_id
    return <Navigate to={ROUTES.DASHBOARD} replace />
}
