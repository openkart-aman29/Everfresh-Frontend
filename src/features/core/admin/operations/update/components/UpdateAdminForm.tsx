import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from "lucide-react"
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useReadAdminQuery, useUpdateAdminMutation } from '@/features/core/admin/apis/AdminAPI'
import { updateAdminBodySchema, type UpdateAdminSchema } from '@/features/core/admin/operations/update/schemas/UpdateAdminSchema'

export function UpdateAdminForm() {
    const { adminId } = useParams()
    const navigate = useNavigate()
    const { data: adminData, isLoading: isLoadingAdmin } = useReadAdminQuery(adminId || '', { skip: !adminId })
    const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation()

    const form = useForm<UpdateAdminSchema>({
        resolver: zodResolver(updateAdminBodySchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            is_active: false,
        }
    })

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form

    // Pre-fill form when admin data loads
    useEffect(() => {
        if (adminData?.data) {
            const admin = adminData.data
            reset({
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                phone: admin.phone,
                is_active: admin.is_active,
            })
        }
    }, [adminData, reset])

    const onSubmit = async (data: UpdateAdminSchema) => {
        if (!adminId) return

        try {
            await updateAdmin({ adminId, data }).unwrap()
            toast.success("Admin profile updated successfully")
            navigate('/app/admin')
        } catch (err) {
            const error = err as { data?: { message?: string } }
            console.error('Failed to update admin:', error)
            toast.error(error?.data?.message || "Failed to update admin profile")
        }
    }

    if (isLoadingAdmin) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const onError = (errors: unknown) => {
        console.error("Form validation errors:", errors)
        toast.error("Please check the form for errors.")
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Edit Admin Profile</CardTitle>
                <CardDescription>Update admin details and status.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" {...register('first_name')} />
                            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" {...register('last_name')} />
                            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" {...register('phone')} />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* eslint-disable-next-line react-compiler/react-compiler */}
                        <Switch
                            id="is_active"
                            checked={watch('is_active') || false}
                            onCheckedChange={(checked) => setValue('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Active Status</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => navigate('/app/admin')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
