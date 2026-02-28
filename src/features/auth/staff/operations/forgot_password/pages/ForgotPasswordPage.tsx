import { ForgotPasswordForm } from '@/features/auth/staff/operations/forgot_password/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-2">
                        {/* Using a key icon or similar would be nice, but using the same 'E' logo for consistency */}
                        <span className="text-2xl font-semibold">E</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight font-heading">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">Enter your email to receive a password reset link</p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    )
}
