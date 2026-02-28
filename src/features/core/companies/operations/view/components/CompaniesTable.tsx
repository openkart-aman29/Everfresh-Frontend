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
    Phone,
    Building2,
    Mail
} from "lucide-react"
import { useReadAllCompaniesQuery, type CompanyDetails } from "@/features/api/company/apis/CompanyAPI"
import { format } from "date-fns"

export function CompaniesTable() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [limit] = useState(10)
    const [sortBy, setSortBy] = useState<keyof CompanyDetails | 'created_at'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const navigate = useNavigate()

    // Fetch all companies data
    const { data: companiesData, isLoading, isError, refetch } = useReadAllCompaniesQuery({
        page,
        limit,
        search
    })

    // Sorting Logic (Client-side for now as API might not support dynamic sorting yet)
    // If API supports sorting, we should pass sortBy/sortOrder to the query
    const sortedData = useMemo(() => {
        if (!companiesData?.data) return []

        const data = [...companiesData.data]

        data.sort((a, b) => {
            let aValue: any = a[sortBy as keyof CompanyDetails]
            let bValue: any = b[sortBy as keyof CompanyDetails]

            if (sortBy === 'created_at') {
                aValue = a.created_at ? new Date(a.created_at).getTime() : 0
                bValue = b.created_at ? new Date(b.created_at).getTime() : 0
            } else if (sortBy === 'company_name') {
                aValue = (a.company_name || '').toLowerCase()
                bValue = (b.company_name || '').toLowerCase()
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return data
    }, [companiesData, sortBy, sortOrder])

    const totalCount = companiesData?.pagination?.total || 0
    const totalPages = companiesData?.pagination?.totalPages || 1

    const handleSort = (column: keyof CompanyDetails | 'created_at') => {
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
                                placeholder="Search companies..."
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value)
                                    setPage(1)
                                }}
                                className="pl-9 h-9 bg-background/50 focus:bg-background transition-all border-muted/60"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-t border-muted/20 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/5">
                            <TableRow className="hover:bg-transparent border-muted/20">
                                <TableHead className="min-w-[240px] pl-6">
                                    <Button variant="ghost" size="sm" onClick={() => handleSort('company_name')} className="h-8 -ml-3 hover:bg-transparent hover:text-primary font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        Company
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[140px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                                <TableHead className="min-w-[120px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Subscription</TableHead>
                                <TableHead className="min-w-[100px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
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
                                            <span className="text-sm">Loading companies...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-red-500 bg-red-50/10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>Failed to load companies data</span>
                                            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8">Retry</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((company) => (
                                    <TableRow
                                        key={company.company_id}
                                        className="group hover:bg-muted/5 border-muted/20 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/app/companies/${company.company_id}`)}
                                    >
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {company.company_name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm font-normal text-muted-foreground">
                                                        {company.slug}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="text-xs">{company.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span className="text-xs">{company.phone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {company.subscription_tier}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
        font-medium border-0 px-2.5 py-0.5 text-xs rounded-full bg-opacity-15
        ${company.is_active
                                                        ? "bg-emerald-500/10 text-emerald-600"
                                                        : "bg-red-500/10 text-red-600"}
    `}
                                            >
                                                {company.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground/70">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="font-semibold text-sm text-foreground">
                                                    {company.created_at ? format(new Date(company.created_at), "MMM d, yyyy") : 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No companies found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-muted/20 px-6 py-4 flex items-center justify-between bg-muted/5">
                    <div className="text-xs text-muted-foreground">
                        Showing <span className="font-medium">{sortedData.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
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
