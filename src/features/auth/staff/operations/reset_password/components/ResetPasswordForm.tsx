import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useResetPasswordMutation } from '@/features/auth/staff/apis/StaffAuthAPI'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/features/auth/staff/operations/reset_password/zod_schemas/ResetPasswordSchema'
import { ROUTES } from '@/lib/constants'
import { PasswordInput } from '@/components/ui/password-input'

interface ResetPasswordFormProps {
    token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const navigate = useNavigate()
    const [resetPassword, { isLoading }] = useResetPasswordMutation()

    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
            resetToken: token, // Pre-fill token if desired, or handle in onSubmit
        },
    })

    const onSubmit = async (data: ResetPasswordSchema) => {
        try {
            // Ensure token is passed from props if not in form data, but here we can just use the prop + form data
            const payload = {
                resetToken: token,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            }
            const result = await resetPassword(payload).unwrap()
            if (result.success) {
                toast.success(result.message)
                navigate(ROUTES.SIGNIN)
            }
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } }
            toast.error(error.data?.message || 'Failed to reset password')
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    New Password
                </label>
                <PasswordInput
                    id="newPassword"
                    disabled={isLoading}
                    {...form.register('newPassword')}
                />
                {form.formState.errors.newPassword && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Confirm Password
                </label>
                <PasswordInput
                    id="confirmPassword"
                    disabled={isLoading}
                    {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    )
}
