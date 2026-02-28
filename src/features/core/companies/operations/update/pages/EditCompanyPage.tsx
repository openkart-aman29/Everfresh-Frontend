import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useReadCompanyQuery, useUpdateCompanyMutation, type UpdateCompanyRequest } from '@/features/api/company/apis/CompanyAPI'
import { CompanyForm } from '@/features/core/companies/operations/update/components/CompanyForm'
// import { useToast } from '@/components/ui/use-toast' // Assuming toast exists, otherwise skip or implement simple alert

export default function EditCompanyPage() {
    const { companyId } = useParams<{ companyId: string }>()
    const navigate = useNavigate()
    // const { toast } = useToast()

    const { data: company, isLoading: isLoadingCompany } = useReadCompanyQuery(companyId || '', {
        skip: !companyId
    })

    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation()

    const handleSubmit = async (data: UpdateCompanyRequest) => {
        if (!companyId) return

        try {
            await updateCompany({ companyId, data }).unwrap()
            // toast({
            //     title: "Success",
            //     description: "Company details updated successfully.",
            // })
            navigate(`/app/companies/${companyId}`)
        } catch (error) {
            console.error("Failed to update company:", error)
            // toast({
            //     variant: "destructive",
            //     title: "Error",
            //     description: "Failed to update company. Please try again.",
            // })
        }
    }

    if (isLoadingCompany) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Company not found</h2>
                <Button onClick={() => navigate('/app/companies')}>Back to Companies</Button>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-3xl mx-auto"
        >
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(`/app/companies/${companyId}`)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Company</h1>
                    <p className="text-muted-foreground">Update details for {company.company_name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CompanyForm
                        defaultValues={{
                            company_name: company.company_name,
                            slug: company.slug,
                            email: company.email || '',
                            phone: company.phone || '',
                            address: company.address || '',
                            subscription_tier: company.subscription_tier as any,
                            is_active: company.is_active,
                        }}
                        onSubmit={handleSubmit}
                        isLoading={isUpdating}
                    />
                </CardContent>
            </Card>
        </motion.div>
    )
}
