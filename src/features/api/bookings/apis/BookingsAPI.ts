import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/api/baseQuery'
import type { Booking } from '@/features/core/scheduler/interfaces/types'

// Define the response structure for read-all
interface PaginatedBookingsData {
    bookings: Booking[]
    total: number
    page: number
    limit: number
    total_pages: number
}

interface ReadAllBookingsResponse {
    success: boolean
    message: string
    data: PaginatedBookingsData
}

export interface CreateBookingPayload {
    company_id: string
    customer_id: string
    service_id: string
    staff_id?: string | null
    scheduled_date: string
    scheduled_time_start: string
    scheduled_time_end?: string | null
    service_location: string
    quantity?: number
    special_instructions?: string | null
}

interface RescheduleBookingPayload {
    booking_id: string
    new_scheduled_date: string
    new_scheduled_time_start: string
    new_scheduled_time_end: string
}



export const bookingsApi = createApi({
    reducerPath: 'bookingsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Booking'],
    endpoints: (builder) => ({
        readAllBookings: builder.query<Booking[], void>({
            query: () => 'bookings/read-all',
            transformResponse: (response: ReadAllBookingsResponse) => response.data.bookings,
            providesTags: ['Booking'],
        }),
        createBooking: builder.mutation<Booking, CreateBookingPayload>({
            query: (body) => ({
                url: 'bookings/create',
                method: 'POST',
                body,
            }),
            transformResponse: (response: { data: Booking }) => response.data,
            invalidatesTags: ['Booking'],
        }),
        rescheduleBooking: builder.mutation<Booking, RescheduleBookingPayload>({
            query: ({ booking_id, ...body }) => ({
                url: `bookings/reschedule/${booking_id}`,
                method: 'POST', // Changed to POST to match potential backend expectation for actions
                body: body,
            }),
            invalidatesTags: ['Booking'],
        }),
    }),
})

export const {
    useReadAllBookingsQuery,
    useRescheduleBookingMutation,
    useCreateBookingMutation,
} = bookingsApi
