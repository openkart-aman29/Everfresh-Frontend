import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, Loader2, Shield, User } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useReadAdminQuery } from '@/features/core/admin/apis/AdminAPI'

interface AdminProfileViewProps {
    adminId: string
}

export function AdminProfileView({ adminId }: AdminProfileViewProps) {
    const navigate = useNavigate()
    const { data: response, isLoading, isError, error } = useReadAdminQuery(adminId)

    // Handle loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading admin profile...</p>
            </div>
        )
    }

    // Handle error or missing data
    if (isError || !response?.success || !response?.data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-[60vh] gap-4 text-center">
                <Shield className="h-12 w-12 text-destructive/50" />
                <h3 className="text-xl font-semibold">Could not load profile</h3>
                <p className="text-muted-foreground max-w-sm">
                    {(error as { data?: { message?: string } })?.data?.message || 'We encountered an error while fetching the admin profile.'}
                </p>
                <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const admin = response.data

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => navigate('/app/dashboard')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden border-none shadow-md bg-white">
                <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                <CardHeader className="relative px-8 pb-2 pt-0">
                    <div className="absolute -top-16 left-8">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-sm ring-1 ring-muted">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin.first_name} ${admin.last_name}`} />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                {admin.first_name?.[0]}{admin.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="pt-20 space-y-1 flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-bold">{admin.first_name} {admin.last_name}</CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge
                                    variant="outline"
                                    className={`
                                        px-2.5 py-0.5 rounded-full border-0 font-medium
                                        ${admin.is_active
                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                            : "bg-red-50 text-red-700 ring-1 ring-red-600/20"}
                                    `}
                                >
                                    {admin.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">Global Administrator</span>
                            </div>
                        </div>
                        {/* <Button variant="outline" onClick={() => navigate(`/app/admin/${adminId}`)}>
                            Edit Profile
                        </Button> */}
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email Address</p>
                                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                                        {admin.email_verified && <span className="text-[10px] text-emerald-600 font-medium">Verified</span>}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Phone Number</p>
                                        <p className="text-sm text-muted-foreground">{admin.phone}</p>
                                        {admin.phone_verified && <span className="text-[10px] text-emerald-600 font-medium">Verified</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Details</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account ID</p>
                                        <p className="text-sm text-muted-foreground font-mono">{admin.admin_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Joined Date</p>
                                        <p className="text-sm text-muted-foreground">
                                            {admin.created_at ? format(new Date(admin.created_at), "MMMM d, yyyy") : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="bg-muted/5 rounded-lg p-4 border border-muted/20">
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>This account has <strong>{admin.roles.join(', ')}</strong> privileges.</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
