import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSignInMutation } from '@/features/auth/staff/apis/StaffAuthAPI'
import { setCredentials } from '@/features/auth/staff/slices/StaffAuthSlice'
import { useAppDispatch } from '@/store/useStoreHook'
import { signInSchema, type SignInSchema } from '@/features/auth/staff/operations/sign_in/zod_schemas/SignInZodSchema'
import { ROUTES } from '@/lib/constants'
import { Link } from 'react-router-dom'

// UI Components (assuming they exist or will be created, using standard HTML for now or placeholders)
// In a real scenario, use imported UI components like Button, Input, etc.
// For now, I'll use basic HTML with Tailwind classes to match "Clean structure".
// I should really create UI components first, but to save steps I'll inline styles or use shadcn-like structure if I had those components.
// The plan said "Create basic UI components" in step 28. I marked it "Done" in task.md?
// Wait, I marked "Install UI & Styling" as done. I haven't CREATED the components files yet.
// I should create Button, Input, Label, Card first?
// Yes, to follow "Implement basic UI components".

// I'll create the Form using standard HTML elements with tailwind classes for now, or create the UI components.
// The user asked for "clean, scalable" structure. Reusable components are key.
// I'll implement basic UI components in the next step or parallel.

export const SignInForm = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [signIn, { isLoading }] = useSignInMutation()

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: SignInSchema) => {
        try {
            const result = await signIn(data).unwrap()
            if (result.success) {
                dispatch(setCredentials({
                    accessToken: result.data.accessToken,
                    user: result.data.user
                }))
                toast.success(result.message)
                if (result.data.user.roles.includes('super_admin')) {
                    navigate('/app/companies')
                } else if (result.data.user.roles.includes('admin')) {
                    navigate(ROUTES.DASHBOARD)
                } else if (result.data.user.roles.includes('staff') && result.data.user.domain_id) {
                    navigate(`/app/staff/${result.data.user.domain_id}`)
                } else {
                    navigate(ROUTES.DASHBOARD)
                }
            }
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } }
            toast.error(error.data?.message || 'Failed to sign in')
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
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register('password')}
                />
                {form.formState.errors.password && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>
                )}
                <div className="flex justify-end">
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
    )
}
