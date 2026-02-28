import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useReadAllStaffQuery, type StaffMember } from "@/features/api/staff/apis/StaffManagementAPI"
import { format } from "date-fns"

export function StaffManagementTable() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [limit] = useState(5)
    const [sortBy, setSortBy] = useState<keyof StaffMember | 'created_at'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const navigate = useNavigate()

    // Fetch all staff data (API handles the "fetch all" logic now)
    const { data: allStaffData, isLoading, isError } = useReadAllStaffQuery({})

    // Derived State: Filtered, Sorted, and Paginated Data
    const processedData = useMemo(() => {
        if (!allStaffData?.data) return { paginatedStaff: [], totalPages: 1, totalCount: 0 }

        // 1. Filter
        let filtered = allStaffData.data.filter((staff: StaffMember) => {
            const searchLower = search.toLowerCase()
            return (
                (staff.first_name?.toLowerCase() || '').includes(searchLower) ||
                (staff.last_name?.toLowerCase() || '').includes(searchLower) ||
                (staff.email?.toLowerCase() || '').includes(searchLower) ||
                (staff.phone?.includes(search) || false)
            )
        })

        // 2. Sort
        filtered.sort((a: StaffMember, b: StaffMember) => {
            let aValue: any = a[sortBy as keyof StaffMember]
            let bValue: any = b[sortBy as keyof StaffMember]

            // Handle specific field transformations if needed (e.g., dates)
            if (sortBy === 'created_at') {
                aValue = a.created_at ? new Date(a.created_at).getTime() : 0
                bValue = b.created_at ? new Date(b.created_at).getTime() : 0
            } else if (sortBy === 'first_name') {
                // Sort by full name roughly
                aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
                bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        // 3. Paginate
        const totalCount = filtered.length
        const totalPages = Math.ceil(totalCount / limit)
        const startIndex = (page - 1) * limit
        const paginatedStaff = filtered.slice(startIndex, startIndex + limit)

        return { paginatedStaff, totalPages, totalCount }
    }, [allStaffData, search, sortBy, sortOrder, page, limit])

    const { paginatedStaff, totalPages, totalCount } = processedData

    const handleSort = (column: keyof StaffMember | 'created_at') => {
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
                                placeholder="Search staff..."
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
                        <Button size="sm" className="h-9" onClick={() => navigate('/app/staff/create')}>
                            Create Staff
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-t border-muted/20 overflow-x-auto">
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
                                            <span className="text-sm">Loading staff directory...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-red-500 bg-red-50/10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>Failed to load staff data</span>
                                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8">Retry</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedStaff.length > 0 ? (
                                paginatedStaff.map((staff) => (
                                    <TableRow
                                        key={staff.staff_id}
                                        className="group hover:bg-muted/5 border-muted/20 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/app/staff/${staff.staff_id}`)}
                                    >
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                    {staff.first_name} {staff.last_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-0.5 font-light">
                                                    {staff.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span className="font-semibold text-sm text-foreground">{staff.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    font-medium border-0 px-2.5 py-0.5 text-xs rounded-full bg-opacity-15
                                                    ${staff.is_Active
                                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700"
                                                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"}
                                                `}
                                            >
                                                {staff.is_Active ? (
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
                                                    {staff.created_at ? format(new Date(staff.created_at), "MMM d, yyyy") : 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No staff members found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-muted/20 px-6 py-4 flex items-center justify-between bg-muted/5">
                    <div className="text-xs text-muted-foreground">
                        Showing <span className="font-medium">{paginatedStaff.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
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
