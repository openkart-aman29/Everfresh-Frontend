import { useMemo, useState } from 'react'
import {
    Inbox,
    Mail,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    MapPin,
    ExternalLink,
    Copy,
    Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import {
    useReadAllEnquiriesQuery,
    useUpdateEnquiryStatusMutation,
    bucketForStatus,
    type Enquiry,
    type EnquiryBucket,
    type EnquiryStatus,
} from '@/features/api/enquiries/apis/EnquiriesAPI'

interface CompanyEnquiriesPanelProps {
    /** Only enquiries belonging to this company are shown. */
    companyId: string
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-amber-50 text-amber-700 border-amber-200',
    converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
}

/** Opens the native maps app on a phone and the web map on a desktop. */
const mapsUrl = (latitude: number, longitude: number) =>
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

/**
 * What gets pasted into a booking's service_location, and from there to the
 * cleaner: the geocoded address plus a tappable pin. The visitor's own typed
 * area detail lives in the message, since no geocoder knows an apartment number.
 */
const locationForBooking = (enquiry: Enquiry) => {
    const lines: string[] = []
    if (enquiry.resolved_address) lines.push(enquiry.resolved_address)
    if (enquiry.latitude !== null && enquiry.longitude !== null) {
        lines.push(mapsUrl(enquiry.latitude, enquiry.longitude))
    }
    return lines.join('\n')
}

/** The action that moves an enquiry forward, per current status. */
const NEXT_ACTION: Partial<Record<EnquiryStatus, { label: string; next: EnquiryStatus }>> = {
    new: { label: 'Mark contacted', next: 'contacted' },
    contacted: { label: 'Mark fulfilled', next: 'converted' },
}

function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
    const [updateStatus, { isLoading }] = useUpdateEnquiryStatusMutation()
    const [copied, setCopied] = useState(false)
    const action = NEXT_ACTION[enquiry.status]
    const hasPin = enquiry.latitude !== null && enquiry.longitude !== null

    const copyLocation = async () => {
        try {
            await navigator.clipboard.writeText(locationForBooking(enquiry))
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard is blocked in some browsers over http; the address is
            // on screen and selectable, so there is nothing to recover from.
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-white/60 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{enquiry.full_name}</span>
                    <Badge variant="outline" className={STATUS_STYLES[enquiry.status]}>
                        {enquiry.status}
                    </Badge>
                    {enquiry.service_name && (
                        <Badge variant="outline" className="bg-muted/50">
                            {enquiry.service_name}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 hover:text-primary">
                        <Mail className="h-3.5 w-3.5" />
                        {enquiry.email}
                    </a>
                    <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" />
                        {enquiry.phone}
                    </a>
                    {enquiry.preferred_date && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {enquiry.preferred_date}
                        </span>
                    )}
                    {enquiry.preferred_time && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {enquiry.preferred_time}
                        </span>
                    )}
                </div>

                {(hasPin || enquiry.resolved_address) && (
                    <div className="space-y-1.5 rounded-md border border-dashed bg-muted/30 p-2.5">
                        <div className="flex items-start gap-1.5 text-sm">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span className="min-w-0">
                                {enquiry.resolved_address ?? 'Location shared, address not resolved'}
                                {enquiry.location_accuracy !== null && (
                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                        ±{enquiry.location_accuracy} m
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pl-5">
                            {hasPin && (
                                <a
                                    href={mapsUrl(enquiry.latitude!, enquiry.longitude!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                    Open in Maps
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={copyLocation}
                                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        Copy for the booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {enquiry.message && (
                    <p className="line-clamp-2 text-sm whitespace-pre-wrap text-muted-foreground">
                        {enquiry.message}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span className="text-xs text-muted-foreground">
                    {format(new Date(enquiry.created_at), 'dd MMM yyyy')}
                </span>
                {action && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() =>
                            updateStatus({ enquiryId: enquiry.enquiry_id, status: action.next })
                        }
                    >
                        {isLoading ? 'Saving...' : action.label}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function CompanyEnquiriesPanel({ companyId }: CompanyEnquiriesPanelProps) {
    const [bucket, setBucket] = useState<EnquiryBucket>('pending')

    // One request covers both tabs: the list is small and switching tabs should
    // not refetch. Filtering happens client-side.
    const { data, isLoading, isError } = useReadAllEnquiriesQuery({ limit: 100 })

    const { pending, fulfilled } = useMemo(() => {
        const scoped = (data?.enquiries ?? []).filter((e) => e.company_id === companyId)
        return {
            pending: scoped.filter((e) => bucketForStatus(e.status) === 'pending'),
            fulfilled: scoped.filter((e) => bucketForStatus(e.status) === 'fulfilled'),
        }
    }, [data, companyId])

    const visible = bucket === 'pending' ? pending : fulfilled

    const tabs: Array<{ key: EnquiryBucket; label: string; count: number; icon: typeof Clock }> = [
        { key: 'pending', label: 'Pending', count: pending.length, icon: Clock },
        { key: 'fulfilled', label: 'Fulfilled', count: fulfilled.length, icon: CheckCircle2 },
    ]

    return (
        <Card className="border-none bg-white/50 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Inbox className="h-5 w-5" />
                    Service Requests
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Tab filter */}
                <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                    {tabs.map((tab) => {
                        const active = bucket === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setBucket(tab.key)}
                                aria-pressed={active}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-white text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
                            </button>
                        )
                    })}
                </div>

                {isLoading && (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-lg" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-6 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Failed to load service requests</span>
                    </div>
                )}

                {!isLoading && !isError && visible.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                        <Inbox className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {bucket === 'pending'
                                ? 'No pending service requests.'
                                : 'Nothing fulfilled yet.'}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && visible.length > 0 && (
                    <div className="space-y-3">
                        {visible.map((enquiry) => (
                            <EnquiryRow key={enquiry.enquiry_id} enquiry={enquiry} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
