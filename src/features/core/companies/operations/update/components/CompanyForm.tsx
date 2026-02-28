import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import type { UpdateCompanyRequest } from '@/features/api/company/apis/CompanyAPI'

const companyFormSchema = z.object({
    company_name: z.string().min(2, { message: "Company name must be at least 2 characters." }),
    slug: z.string().min(2, { message: "Slug must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    subscription_tier: z.enum(['free', 'basic', 'premium', 'enterprise']).optional().nullable(),
    is_active: z.boolean(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

interface CompanyFormProps {
    defaultValues?: Partial<CompanyFormValues>
    onSubmit: (data: UpdateCompanyRequest) => void
    isLoading?: boolean
    submitLabel?: string
}

export function CompanyForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save Changes" }: CompanyFormProps) {
    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            company_name: defaultValues?.company_name || '',
            slug: defaultValues?.slug || '',
            email: defaultValues?.email || '',
            phone: defaultValues?.phone || '',
            address: defaultValues?.address || '',
            subscription_tier: defaultValues?.subscription_tier || 'basic',
            is_active: defaultValues?.is_active ?? true,
        },
    })

    const handleSubmit = (data: CompanyFormValues) => {
        // Transform empty strings to null for optional fields if needed, 
        // or just pass as is matching the interface
        const formattedData: UpdateCompanyRequest = {
            company_name: data.company_name,
            slug: data.slug,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            logo_url: null, // Not handling logo upload yet
            subscription_tier: data.subscription_tier as any,
            is_active: data.is_active,
        }
        onSubmit(formattedData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Corp" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input placeholder="acme-corp" {...field} />
                                </FormControl>
                                <FormDescription>Unique identifier for the company.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="contact@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1 234 567 890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Main St, City, Country" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subscription_tier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subscription Tier</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a tier" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active Status</FormLabel>
                                    <FormDescription>
                                        Disable to suspend company access.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
