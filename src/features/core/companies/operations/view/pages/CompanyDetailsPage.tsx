function MetricCard({ label, value, change, icon: Icon, className }: { label: string, value: string | number, change?: number, icon: any, className?: string }) {
    return (
        <Card className={`border-none shadow-sm ${className || 'bg-white/50 backdrop-blur-sm'}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-2 text-xl font-bold truncate" title={String(value)}>{value}</div>
                {change !== undefined && (
                    <p className={`text-[11px] ${change >= 0 ? 'text-emerald-500' : 'text-red-500'} truncate`}>
                        {change > 0 ? '+' : ''}{change}%
                        <span className="text-muted-foreground ml-1">vs last month</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Calendar,
    TrendingUp,
    ListTodo,
    CheckCircle2,
    XCircle,
    Clock,
    Pencil,
    Trash2,
    Shield,
    Inbox,
    Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useReadCompanyQuery } from '@/features/api/company/apis/CompanyAPI'
import CompanyEnquiriesPanel from '@/features/core/companies/operations/view/components/CompanyEnquiriesPanel'
import { format } from 'date-fns'

export default function CompanyDetailsPage() {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const { companyId } = useParams<{ companyId: string }>()
    const navigate = useNavigate()
    const { data: company, isLoading, isError } = useReadCompanyQuery(companyId || '', {
        skip: !companyId
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading company details...</p>
                </div>
            </div>
        )
    }

    if (isError || !company) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="bg-red-50 p-4 rounded-full">
                    <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold">Failed to load company</h2>
                <Button onClick={() => navigate('/app/companies')}>Back to Companies</Button>
            </div>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/app/companies')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{company.company_name}</h1>
                            <Badge variant={company.is_active ? "default" : "destructive"} className={company.is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                {company.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {company.slug}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" onClick={() => navigate(`/app/admin?company_id=${companyId}`)}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Management
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                        <Info className="mr-2 h-4 w-4" /> Company Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/app/companies/${companyId}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" disabled>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    <Badge variant="outline" className="px-3 py-1 flex items-center gap-2 h-9">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="capitalize">{company.subscription_tier} Tier</span>
                    </Badge>
                </div>
            </motion.div>

            {/* Metrics strip - full width so six compact tiles fit on one row and
                the near-empty sidebar that used to hold two of them is gone. */}
            <motion.div
                variants={itemVariants}
                className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
            >
                <MetricCard
                    label="Total Bookings"
                    value={company.dashboard_metrics.total_bookings}
                    change={company.dashboard_metrics.total_bookings_change_percent}
                    icon={ListTodo}
                />
                <MetricCard
                    label="Revenue"
                    value={`${company.currency} ${company.dashboard_metrics.revenue}`}
                    change={company.dashboard_metrics.revenue_change_percent}
                    icon={TrendingUp}
                />
                <MetricCard
                    label="Pending"
                    value={company.dashboard_metrics.pending_bookings}
                    icon={Clock}
                    className="bg-amber-50/50 border-amber-100"
                />
                <MetricCard
                    label="Completed"
                    value={company.dashboard_metrics.completed_bookings}
                    icon={CheckCircle2}
                    className="bg-emerald-50/50 border-emerald-100"
                />
                <MetricCard
                    label="Active Agents"
                    value={company.dashboard_metrics.active_agents}
                    icon={Shield}
                />
                <MetricCard
                    label="Waitlist"
                    value={company.dashboard_metrics.wait_list}
                    icon={Inbox}
                />
            </motion.div>

            {/* Company details on demand, so the page itself stays compact */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {company.company_name}
                        </DialogTitle>
                        <DialogDescription>Company profile and platform settings.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-1 sm:grid-cols-2">
                        <InfoItem icon={Mail} label="Email" value={company.email} />
                        <InfoItem icon={Phone} label="Phone" value={company.phone} />
                        <InfoItem icon={MapPin} label="Address" value={company.address} />
                        <InfoItem icon={Globe} label="Timezone" value={company.timezone} />
                        <InfoItem icon={CreditCard} label="Currency" value={company.currency} />
                        <InfoItem icon={Shield} label="Slug" value={company.slug} />
                        <InfoItem
                            icon={CreditCard}
                            label="Subscription"
                            value={`${company.subscription_tier} tier`}
                        />
                        <InfoItem
                            icon={Calendar}
                            label="Joined"
                            value={company.created_at ? format(new Date(company.created_at), "PPP") : 'N/A'}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Service requests raised from the public website */}
            <motion.div variants={itemVariants}>
                <CompanyEnquiriesPanel companyId={company.company_id} />
            </motion.div>
        </motion.div>
    )
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | null }) {
    return (
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
            <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium" title={value || ''}>
                    {value || 'N/A'}
                </p>
            </div>
        </div>
    )
}
