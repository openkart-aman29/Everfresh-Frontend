import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useForgotPasswordMutation } from '@/features/auth/staff/apis/StaffAuthAPI'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/features/auth/staff/operations/forgot_password/zod_schemas/ForgotPasswordSchema'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

export const ForgotPasswordForm = () => {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data: ForgotPasswordSchema) => {
        try {
            const result = await forgotPassword(data).unwrap()
            if (result.success) {
                toast.success(result.message)
                form.reset()
            }
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } }
            toast.error(error.data?.message || 'Failed to send reset link')
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="name@example.com"
                    {...form.register('email')}
                />
                {form.formState.errors.email && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center text-sm text-muted-foreground mt-4">
                <Link to={ROUTES.SIGNIN} className="hover:text-primary transition-colors underline underline-offset-4">
                    Back to Sign In
                </Link>
            </div>
        </form>
    )
}
