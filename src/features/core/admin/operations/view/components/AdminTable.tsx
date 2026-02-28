import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    Card,
    CardContent,
    CardHeader
} from "@/components/ui/card"
import {
    ArrowUpDown,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    Phone
} from "lucide-react"
import { useReadAllAdminsQuery, type AdminUser } from '@/features/core/admin/apis/AdminAPI'
import { format } from "date-fns"

export function AdminTable() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [limit] = useState(10)
    const [sortBy, setSortBy] = useState<keyof AdminUser | 'created_at'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const companyId = searchParams.get('company_id')

    const { data: allAdminData, isLoading, isError } = useReadAllAdminsQuery(
        companyId ? { company_id: companyId } : undefined
    )

    // Derived State: Filtered, Sorted, and Paginated Data
    const processedData = useMemo(() => {
        // Access nested data structure: data.data.data
        const admins = allAdminData?.data?.data || []

        if (!admins.length) return { paginatedAdmins: [], totalPages: 1, totalCount: 0 }

        // 1. Filter
        let filtered = admins.filter((admin: AdminUser) => {
            const searchLower = search.toLowerCase()
            return (
                (admin.first_name?.toLowerCase() || '').includes(searchLower) ||
                (admin.last_name?.toLowerCase() || '').includes(searchLower) ||
                (admin.email?.toLowerCase() || '').includes(searchLower) ||
                (admin.phone?.includes(search) || false)
            )
        })

        // 2. Sort
        filtered.sort((a: AdminUser, b: AdminUser) => {
            let aValue: string | number | boolean | undefined | null = a[sortBy as keyof AdminUser] as string | number | boolean | undefined | null
            let bValue: string | number | boolean | undefined | null = b[sortBy as keyof AdminUser] as string | number | boolean | undefined | null

            // Handle specific field transformations
            if (sortBy === 'created_at') {
                aValue = a.created_at ? new Date(a.created_at).getTime() : 0
                bValue = b.created_at ? new Date(b.created_at).getTime() : 0
            } else if (sortBy === 'first_name') {
                aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
                bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
            }

            const aStr = String(aValue ?? '')
            const bStr = String(bValue ?? '')

            if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
            if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        // 3. Paginate
        const totalCount = filtered.length
        const totalPages = Math.ceil(totalCount / limit)
        const startIndex = (page - 1) * limit
        const paginatedAdmins = filtered.slice(startIndex, startIndex + limit)

        return { paginatedAdmins, totalPages, totalCount }
    }, [allAdminData, search, sortBy, sortOrder, page, limit])

    const { paginatedAdmins, totalPages, totalCount } = processedData

    const handleSort = (column: keyof AdminUser | 'created_at') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    return (
        <Card className="w-full border-none shadow-sm bg-white backdrop-blur-sm">
            <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                            <Input
                                placeholder="Search admins..."
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value)
                                    setPage(1)
                                }}
                                className="pl-9 h-9 bg-background/50 focus:bg-background transition-all border-muted/60"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Create Admin button passing company_id if available */}
                        <Button
                            size="sm"
                            className="h-9"
                            onClick={() => navigate(companyId ? `/app/admin/create?company_id=${companyId}` : '/app/admin/create')}
                        >
                            Create Admin
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-t border-muted/20">
                    <Table>
                        <TableHeader className="bg-muted/5">
                            <TableRow className="hover:bg-transparent border-muted/20">
                                <TableHead className="min-w-[240px] pl-6">
                                    <Button variant="ghost" size="sm" onClick={() => handleSort('first_name')} className="h-8 -ml-3 hover:bg-transparent hover:text-primary font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        Name
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[140px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                                <TableHead className="min-w-[120px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                <TableHead className="min-w-[140px]">
                                    <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="h-8 -ml-3 hover:bg-transparent hover:text-primary font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        Joined Date
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col justify-center items-center gap-3 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="text-sm">Loading admin directory...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-red-500 bg-red-50/10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>Failed to load admin data</span>
                                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8">Retry</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedAdmins.length > 0 ? (
                                paginatedAdmins.map((admin) => (
                                    <TableRow
                                        key={admin.admin_id}
                                        className="group hover:bg-muted/5 border-muted/20 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/app/admin/${admin.admin_id}`)}
                                    >
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {admin.first_name} {admin.last_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-0.5 font-light">
                                                    {admin.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span className="font-semibold text-sm text-foreground">{admin.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    font-medium border-0 px-2.5 py-0.5 text-xs rounded-full bg-opacity-15
                                                    ${admin.is_active
                                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700"
                                                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"}
                                                `}
                                            >
                                                {admin.is_active ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground/70">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="font-semibold text-sm text-foreground">
                                                    {admin.created_at ? format(new Date(admin.created_at), "MMM d, yyyy") : 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No admins found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-muted/20 px-6 py-4 flex items-center justify-between bg-muted/5">
                    <div className="text-xs text-muted-foreground">
                        Showing <span className="font-medium">{paginatedAdmins.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-muted-foreground mr-4">
                            Page {page} of {totalPages === 0 ? 1 : totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
