import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateCompanyMutation } from '@/features/api/company/apis/CompanyAPI'
import { toast } from 'sonner'
import {
    createCompanyBodySchema,
    type CreateCompanySchema
} from '@/features/core/companies/operations/create/schemas/createCompanySchema'

export function CreateCompanyForm() {
    const navigate = useNavigate()
    const [createCompany, { isLoading }] = useCreateCompanyMutation()

    const form = useForm<CreateCompanySchema>({
        resolver: zodResolver(createCompanyBodySchema),
        defaultValues: {
            company_name: '',
            slug: '',
            email: '',
            phone: '',
            address: '',
            logo_url: '',
            subscription_tier: 'free'
        }
    })

    const { register, handleSubmit, formState: { errors } } = form

    const onSubmit = async (data: CreateCompanySchema) => {
        try {
            const payload = {
                ...data,
                slug: data.slug || undefined,
                logo_url: data.logo_url || undefined,
            }
            await createCompany(payload).unwrap()
            toast.success(`${data.company_name} has been successfully created.`)
            navigate('/app/companies')
        } catch (err) {
            const error = err as { data?: { message?: string } }
            console.error('Failed to create company:', error)
            toast.error(error?.data?.message || "There was an error creating the company. Please try again.")
        }
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Company Details</CardTitle>
                <CardDescription>
                    Enter the information for the new company.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                placeholder="e.g. Acme Corp"
                                {...register('company_name')}
                                className={errors.company_name ? "border-red-500" : ""}
                            />
                            {errors.company_name && (
                                <p className="text-sm text-red-500">{errors.company_name.message}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (Optional)</Label>
                            <Input
                                id="slug"
                                placeholder="e.g. acme-corp"
                                {...register('slug')}
                                className={errors.slug ? "border-red-500" : ""}
                            />
                            {errors.slug && (
                                <p className="text-sm text-red-500">{errors.slug.message}</p>
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
                                placeholder="admin@acme.com"
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

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            placeholder="123 Example St, City, Country"
                            {...register('address')}
                            className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Logo URL */}
                        <div className="space-y-2">
                            <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                            <Input
                                id="logo_url"
                                placeholder="https://example.com/logo.png"
                                {...register('logo_url')}
                                className={errors.logo_url ? "border-red-500" : ""}
                            />
                            {errors.logo_url && (
                                <p className="text-sm text-red-500">{errors.logo_url.message}</p>
                            )}
                        </div>

                        {/* Subscription Tier */}
                        <div className="space-y-2">
                            <Label htmlFor="subscription_tier">Subscription Tier</Label>
                            <select
                                id="subscription_tier"
                                {...register('subscription_tier')}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.subscription_tier ? "border-red-500" : ""}`}
                            >
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                            {errors.subscription_tier && (
                                <p className="text-sm text-red-500">{errors.subscription_tier.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/app/companies')}
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
                                    Create Company
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
