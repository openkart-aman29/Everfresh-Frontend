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

interface RescheduleBookingPayload {
    booking_id: string
    new_scheduled_date: string
    new_scheduled_time_start: string
    new_scheduled_time_end: string
}



export const bookingsApi = createApi({
    reducerPath: 'bookingsApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        readAllBookings: builder.query<Booking[], void>({
            query: () => 'bookings/read-all',
            transformResponse: (response: ReadAllBookingsResponse) => response.data.bookings,
        }),
        rescheduleBooking: builder.mutation<Booking, RescheduleBookingPayload>({
            query: ({ booking_id, ...body }) => ({
                url: `bookings/reschedule/${booking_id}`,
                method: 'POST', // Changed to POST to match potential backend expectation for actions
                body: body,
            }),
        }),
    }),
})

export const { useReadAllBookingsQuery, useRescheduleBookingMutation } = bookingsApi
