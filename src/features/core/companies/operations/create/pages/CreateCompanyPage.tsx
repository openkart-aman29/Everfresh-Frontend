import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { CreateCompanyForm } from '@/features/core/companies/operations/create/components/CreateCompanyForm'

export default function CreateCompanyPage() {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-3xl mx-auto w-full"
        >
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/app/companies')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Company</h1>
                    <p className="text-muted-foreground">Register a new company on the platform.</p>
                </div>
            </div>

            <CreateCompanyForm />
        </motion.div>
    )
}
