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
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReadCompanyQuery } from '@/features/api/company/apis/CompanyAPI'
import { format } from 'date-fns'

export default function CompanyDetailsPage() {
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

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Company Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <InfoItem icon={Mail} label="Email" value={company.email} />
                            <InfoItem icon={Phone} label="Phone" value={company.phone} />
                            <InfoItem icon={MapPin} label="Address" value={company.address} />
                            <InfoItem icon={Globe} label="Timezone" value={company.timezone} />
                            <InfoItem icon={CreditCard} label="Currency" value={company.currency} />
                            <InfoItem
                                icon={Calendar}
                                label="Joined"
                                value={company.created_at ? format(new Date(company.created_at), "PPP") : 'N/A'}
                            />
                        </CardContent>
                    </Card>

                    {/* Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                            label="Pending Bookings"
                            value={company.dashboard_metrics.pending_bookings}
                            icon={Clock}
                            className="bg-amber-50/50 border-amber-100"
                        />
                        <MetricCard
                            label="Completed Bookings"
                            value={company.dashboard_metrics.completed_bookings}
                            icon={CheckCircle2}
                            className="bg-emerald-50/50 border-emerald-100"
                        />
                    </div>
                </motion.div>

                {/* Sidebar Info/Settings Placeholder */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Platform Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Active Agents</span>
                                    <span className="font-medium">{company.dashboard_metrics.active_agents}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-full opacity-20" /> {/* Placeholder width */}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Waitlist</span>
                                    <span className="font-medium">{company.dashboard_metrics.wait_list}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    )
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | null }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium mt-0.5 truncate max-w-[200px]" title={value || ''}>
                    {value || 'N/A'}
                </p>
            </div>
        </div>
    )
}

function MetricCard({ label, value, change, icon: Icon, className }: { label: string, value: string | number, change?: number, icon: any, className?: string }) {
    return (
        <Card className={`border-none shadow-sm ${className || 'bg-white/50 backdrop-blur-sm'}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold">{value}</div>
                    {change !== undefined && (
                        <p className={`text-xs ${change >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
                            {change > 0 ? '+' : ''}{change}%
                            <span className="text-muted-foreground ml-1">from last month</span>
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
