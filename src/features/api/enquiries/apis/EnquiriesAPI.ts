import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/api/baseQuery'

/** Mirrors the backend's service_enquiries.status check constraint. */
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'closed'

/**
 * The UI groups the four backend statuses into two buckets:
 *   pending   = new | contacted      (still needs action)
 *   fulfilled = converted | closed   (dealt with)
 */
export type EnquiryBucket = 'pending' | 'fulfilled'

export const PENDING_STATUSES: EnquiryStatus[] = ['new', 'contacted']
export const FULFILLED_STATUSES: EnquiryStatus[] = ['converted', 'closed']

export const bucketForStatus = (status: EnquiryStatus): EnquiryBucket =>
    PENDING_STATUSES.includes(status) ? 'pending' : 'fulfilled'

export interface Enquiry {
    enquiry_id: string
    company_id: string
    full_name: string
    email: string
    phone: string
    service_id: string | null
    service_name: string | null
    message: string | null
    preferred_date: string | null
    /** Arrival-window label the visitor chose, e.g. "10:00 - 12:00". */
    preferred_time: string | null
    /** Shared from the visitor's device; null unless they tapped "share my location". */
    latitude: number | null
    longitude: number | null
    /** Device-reported uncertainty in metres. Large values are wifi guesses. */
    location_accuracy: number | null
    /** Reverse-geocoded at ingest. Names the building at best, never the unit. */
    resolved_address: string | null
    geocoded_at: string | null
    status: EnquiryStatus
    booking_id: string | null
    handled_by: string | null
    admin_notes: string | null
    source: string
    created_at: string
    updated_at: string
}

export interface ReadAllEnquiriesResponse {
    enquiries: Enquiry[]
    total: number
    page: number
    limit: number
}

interface StandardResponse<T> {
    success: boolean
    status: number
    message: string
    code: string
    data: T
    errors: Array<{ field: string; message: string }>
}

export interface ReadAllEnquiriesArgs {
    status?: EnquiryStatus
    page?: number
    limit?: number
}

export const enquiriesApi = createApi({
    reducerPath: 'enquiriesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Enquiry'],
    endpoints: (builder) => ({
        readAllEnquiries: builder.query<ReadAllEnquiriesResponse, ReadAllEnquiriesArgs>({
            query: ({ status, page = 1, limit = 50 }) => {
                const params = new URLSearchParams()
                if (status) params.set('status', status)
                params.set('page', String(page))
                params.set('limit', String(limit))
                return `/enquiries/read-all?${params.toString()}`
            },
            transformResponse: (response: StandardResponse<ReadAllEnquiriesResponse>) => response.data,
            providesTags: ['Enquiry'],
        }),

        updateEnquiryStatus: builder.mutation<
            Enquiry,
            { enquiryId: string; status: EnquiryStatus; admin_notes?: string | null }
        >({
            query: ({ enquiryId, status, admin_notes }) => ({
                url: `/enquiries/update-status/${enquiryId}`,
                method: 'PATCH',
                body: { status, admin_notes: admin_notes ?? null },
            }),
            transformResponse: (response: StandardResponse<Enquiry>) => response.data,
            invalidatesTags: ['Enquiry'],
        }),
    }),
})

export const { useReadAllEnquiriesQuery, useUpdateEnquiryStatusMutation } = enquiriesApi
