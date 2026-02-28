import { SignInForm } from '@/features/auth/staff/operations/sign_in/components/SignInForm'
import { Link } from 'react-router-dom'

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    {/* Logo Placeholder */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-2">
                        <span className="text-2xl font-semibold">E</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight font-heading">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                </div>
                <SignInForm />
                <div className="text-center text-sm text-muted-foreground mt-4">
                    <Link to="/" className="hover:text-primary transition-colors underline underline-offset-4">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
