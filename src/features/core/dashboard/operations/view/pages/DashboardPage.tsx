import { DashboardStats } from '@/features/core/dashboard/operations/view/components/DashboardStats'
// import { SchedulerPreview } from '@/features/core/dashboard/operations/view/components/SchedulerPreview'
// import { RecentBookingsTable } from '@/features/core/dashboard/operations/view/components/RecentBookingsTable'
import { StaffManagementTable } from '@/features/core/staff/operations/view/components/StaffManagementTable'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your business performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Booking
                    </Button>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <DashboardStats />
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* <SchedulerPreview /> */}
                {/* <RecentBookingsTable /> */}
                <div className="col-span-1 md:col-span-2 lg:col-span-7">
                    <StaffManagementTable />
                </div>
            </motion.div>
        </div>
    )
}
