import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from "lucide-react"
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useReadStaffQuery, useUpdateStaffMutation } from '@/features/api/staff/apis/StaffManagementAPI'
import { updateStaffBodySchema, type UpdateStaffSchema } from '@/features/core/staff/operations/update/schemas/UpdateStaffSchema'

export function UpdateStaffForm() {
    const { staffId } = useParams()
    const navigate = useNavigate()
    const { data: staff, isLoading: isLoadingStaff } = useReadStaffQuery(staffId || '', { skip: !staffId })
    const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation()

    const form = useForm<UpdateStaffSchema>({
        resolver: zodResolver(updateStaffBodySchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            isActive: false,
            skills: []
        }
    })

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form

    // Pre-fill form when staff data loads
    useEffect(() => {
        if (staff) {
            reset({
                firstName: staff.first_name,
                lastName: staff.last_name,
                phone: staff.phone,
                isActive: staff.is_Active,
                skills: staff.skills || []
            })
        }
    }, [staff, reset])

    const onSubmit = async (data: UpdateStaffSchema) => {
        if (!staffId) return

        try {
            await updateStaff({ staffId, data }).unwrap()
            toast.success("Staff profile updated successfully")
            navigate(`/app/staff/${staffId}`)
        } catch (error: any) {
            console.error('Failed to update staff:', error)
            toast.error(error?.data?.message || "Failed to update staff profile")
        }
    }

    if (isLoadingStaff) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const onError = (errors: any) => {
        console.error("Form validation errors:", errors)
        toast.error("Please check the form for errors. Ensure all required fields are filled correctly.")
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update staff member details and availability.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register('firstName')} />
                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register('lastName')} />
                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register('phone')} />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Skills</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {watch('skills')?.map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={skill}
                                        onChange={(e) => {
                                            const newSkills = [...(watch('skills') || [])];
                                            newSkills[index] = e.target.value;
                                            setValue('skills', newSkills);
                                        }}
                                        placeholder="e.g. Hair Styling"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            const newSkills = [...(watch('skills') || [])];
                                            newSkills.splice(index, 1);
                                            setValue('skills', newSkills);
                                        }}
                                    >
                                        <span className="sr-only">Remove</span>
                                        &times;
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const currentSkills = watch('skills') || [];
                                setValue('skills', [...currentSkills, '']);
                            }}
                        >
                            + Add Skill
                        </Button>
                        {errors.skills && (
                            <p className="text-sm text-red-500">{errors.skills.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={watch('isActive') || false}
                            onCheckedChange={(checked) => setValue('isActive', checked)}
                        />
                        <Label htmlFor="isActive">Active Status</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => navigate(`/app/staff/${staffId}`)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
