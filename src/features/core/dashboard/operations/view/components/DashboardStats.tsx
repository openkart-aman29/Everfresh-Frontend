import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign, Activity } from "lucide-react"
import { useReadCompanyQuery } from "@/features/api/company/apis/CompanyAPI"
import { useSelector } from "react-redux"
import { type RootState } from "@/store/Store"

export function DashboardStats() {
    // Get company_id from authenticated user
    const companyId = useSelector((state: RootState) => state.staffAuth.user?.company_id)

    // Fetch company details
    const { data: companyDetails, isLoading, isError } = useReadCompanyQuery(companyId || '', {
        skip: !companyId
    })

    const metrics = companyDetails?.dashboard_metrics

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-4 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted rounded mb-1" />
                            <div className="h-3 w-32 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (isError || !metrics) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-full bg-red-50 border-red-100">
                    <CardContent className="flex items-center justify-center p-6 text-red-600 gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Failed to load dashboard statistics</span>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Bookings */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.total_bookings}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.total_bookings_change_percent > 0 ? '+' : ''}
                        {metrics.total_bookings_change_percent}% from last month
                    </p>
                </CardContent>
            </Card>

            {/* Wait List */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wait List</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.wait_list}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.wait_list_change_percent > 0 ? '+' : ''}
                        {metrics.wait_list_change_percent}% from last month
                    </p>
                </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(metrics.revenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.revenue_change_percent > 0 ? '+' : ''}
                        {metrics.revenue_change_percent}% from last month
                    </p>
                </CardContent>
            </Card>

            {/* Active Agents */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.active_agents}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.active_agents_change > 0 ? '+' : ''}
                        {metrics.active_agents_change} from last month
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
