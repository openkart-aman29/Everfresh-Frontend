import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CompaniesTable } from '@/features/core/companies/operations/view/components/CompaniesTable'
import { useNavigate } from 'react-router-dom'

export default function CompaniesPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
                    <p className="text-muted-foreground">Manage all companies on the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/app/companies/create')}>
                        <Plus className="mr-2 h-4 w-4" /> Create Company
                    </Button>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CompaniesTable />
            </motion.div>
        </div>
    )
}
