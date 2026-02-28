import { useSearchParams, Link } from 'react-router-dom'
import { ResetPasswordForm } from '@/features/auth/staff/operations/reset_password/components/ResetPasswordForm'
import { ROUTES } from '@/lib/constants'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-sm text-center">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Link</h1>
                    <p className="text-muted-foreground">The password reset link is invalid or missing a token.</p>
                    <Link to={ROUTES.SIGNIN} className="text-primary hover:underline underline-offset-4">
                        Return to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-2">
                        <span className="text-2xl font-semibold">E</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight font-heading">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">Enter your new password below</p>
                </div>
                <ResetPasswordForm token={token} />
            </div>
        </div>
    )
}
