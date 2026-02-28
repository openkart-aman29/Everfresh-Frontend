import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSignupMutation } from '@/features/auth/staff/apis/StaffAuthAPI'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/useStoreHook'
import {
    staffSignUpZodSchema,
    type StaffSignUpSchema
} from '@/features/core/staff/operations/create/schemas/CreateStaffSchema'

// We now get Company ID dynamically from the authenticated user's state

export function CreateStaffForm() {
    const navigate = useNavigate()
    const [signup, { isLoading }] = useSignupMutation()
    const [showPassword, setShowPassword] = useState(false)
    const { user } = useAppSelector(state => state.staffAuth)
    const companyId = user?.company_id || ''

    const form = useForm<StaffSignUpSchema>({
        resolver: zodResolver(staffSignUpZodSchema),
        defaultValues: {
            company_id: companyId,
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone: '',
            role_code: 'staff' as 'staff' | 'admin'
        }
    })

    const { register, handleSubmit, formState: { errors } } = form

    const onSubmit = async (data: StaffSignUpSchema) => {
        try {
            await signup(data).unwrap()

            toast.success(`${data.first_name} ${data.last_name} has been successfully registered.`)

            // Redirect back to staff list
            navigate('/app/dashboard')
        } catch (error: any) {
            console.error('Failed to create staff:', error)
            toast.error(error?.data?.message || "There was an error creating the staff member. Please try again.")
        }
    }

    if (!companyId) {
        return (
            <Card className="border-none shadow-md">
                <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <p className="text-muted-foreground">A Company ID is required to create a Staff member. Please ensure you are logged into a company account.</p>
                        <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Staff Details</CardTitle>
                <CardDescription>
                    Enter the information for the new staff member. They will use these credentials to log in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Display Company ID (Read-only) */}
                    <div className="space-y-2">
                        <Label>Company ID</Label>
                        <Input
                            value={companyId}
                            disabled
                            className="bg-muted cursor-not-allowed text-muted-foreground"
                            title="Cannot be changed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                placeholder="e.g. John"
                                {...register('first_name')}
                                className={errors.first_name ? "border-red-500" : ""}
                            />
                            {errors.first_name && (
                                <p className="text-sm text-red-500">{errors.first_name.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                placeholder="e.g. Doe"
                                {...register('last_name')}
                                className={errors.last_name ? "border-red-500" : ""}
                            />
                            {errors.last_name && (
                                <p className="text-sm text-red-500">{errors.last_name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                {...register('email')}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+1234567890"
                                {...register('phone')}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                {...register('password')}
                                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Must be at least 8 chars, include uppercase, lowercase, number, and special char.
                        </p>
                    </div>

                    {/* Hidden Company ID Field */}
                    <input type="hidden" {...register('company_id')} />
                    <input type="hidden" {...register('role_code')} />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/app/staff')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Staff
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
