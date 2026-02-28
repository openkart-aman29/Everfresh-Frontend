import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, Loader2, Shield } from "lucide-react"
import { format } from "date-fns"
import { useReadStaffQuery } from '@/features/api/staff/apis/StaffManagementAPI'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { RecentBookingsTable } from '@/features/core/staff/operations/view/components/RecentBookingsTable'

import { useAppSelector } from '@/store/useStoreHook'

export default function StaffDetailsPage() {
    const { staffId } = useParams()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.staffAuth)

    const { data: staff, isLoading, isError, error } = useReadStaffQuery(staffId || '', {
        skip: !staffId
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading staff details...</p>
            </div>
        )
    }

    if (isError || !staff) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[60vh] gap-4 text-center">
                <Shield className="h-12 w-12 text-destructive/50" />
                <h3 className="text-xl font-semibold">Could not load staff details</h3>
                <p className="text-muted-foreground max-w-sm">
                    We encountered an error while fetching the staff member's information.
                    {(error as any)?.data?.message || 'Please try again later.'}
                </p>
                <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={() => navigate('/app/staff')}>
                        Go Back
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Breadcrumb-ish */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => {
                        if (user?.roles.includes('admin')) {
                            navigate('/app/dashboard')
                        } else {
                            navigate('/app/staff')
                        }
                    }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Staff List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md bg-white">
                        <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                        <CardHeader className="relative px-6 pb-2 pt-0">
                            <div className="absolute -top-12 left-6">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-sm ring-1 ring-muted">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${staff.first_name} ${staff.last_name}`} />
                                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                        {staff.first_name[0]}{staff.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="pt-14 space-y-1">
                                <CardTitle className="text-2xl font-bold">{staff.first_name} {staff.last_name}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge
                                        variant="outline"
                                        className={`
                                            px-2 py-0.5 rounded-full border-0 font-medium
                                            ${staff.is_available
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                                : "bg-red-50 text-red-700 ring-1 ring-red-600/20"}
                                        `}
                                    >
                                        {staff.is_available ? "Available" : "Unavailable"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">ID: {staff.staff_id.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid gap-0.5">
                                        <span className="text-xs font-medium text-muted-foreground">Email Address</span>
                                        <span className="text-foreground">{staff.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid gap-0.5">
                                        <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
                                        <span className="text-foreground">{staff.phone}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid gap-0.5">
                                        <span className="text-xs font-medium text-muted-foreground">Joined Date</span>
                                        <span className="text-foreground">{format(new Date(staff.created_at), "MMMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-2 pt-2">
                                <Button className="w-full" variant="outline" onClick={() => navigate(`/app/staff/${staffId}/edit`)}>Edit Profile</Button>
                                {/* <Button className="w-full" variant="destructive">Deactivate</Button> */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stats & Schedule (Placeholder for now) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-muted/10 border border-muted/20">
                                    <div className="text-2xl font-bold text-primary">{staff.work_metrics?.total_hours_worked || '0'}</div>
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Total Hours</div>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/10 border border-muted/20">
                                    <div className="text-2xl font-bold text-primary">{staff.work_metrics?.current_month_hours || '0'}</div>
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Month Hours</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Confirmed Booking or Empty State */}
                    {staff.next_confirmed_booking ? (
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Next Scheduled Service
                                        </CardTitle>
                                        <CardDescription>
                                            Booking #{staff.next_confirmed_booking.booking_number}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        Confirmed
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Date & Time</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(staff.next_confirmed_booking.scheduled_date), "MMMM d, yyyy")}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {staff.next_confirmed_booking.scheduled_time_start} - {staff.next_confirmed_booking.scheduled_time_end || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                            <Loader2 className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Service Details</p>
                                            <p className="text-sm text-muted-foreground">{staff.next_confirmed_booking.service_name}</p>
                                            <p className="text-xs text-muted-foreground">{staff.next_confirmed_booking.service_category}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Customer</p>
                                            <p className="text-sm text-muted-foreground">{staff.next_confirmed_booking.customer_name}</p>
                                            {staff.next_confirmed_booking.customer_phone && <p className="text-xs text-muted-foreground">{staff.next_confirmed_booking.customer_phone}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                                            <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Location</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{staff.next_confirmed_booking.service_location}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-sm bg-white h-[300px] flex items-center justify-center text-muted-foreground bg-muted/5 border-dashed border-2 border-muted/20">
                            <div className="text-center space-y-3">
                                <div className="h-12 w-12 mx-auto text-muted-foreground/20 rounded-full border-2 border-current flex items-center justify-center">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-lg text-muted-foreground/80">No Booking Assigned</p>
                                    <p className="text-sm opacity-60">This staff member has no upcoming confirmed bookings.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
