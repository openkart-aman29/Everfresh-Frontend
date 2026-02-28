import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/api/baseQuery'


export interface StaffMember {
    staff_id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    is_available: boolean
    is_Active: boolean
    created_at: string
    updated_at: string
    work_metrics: {
        total_hours_worked: number
        current_month_hours: number
    }
    next_confirmed_booking: unknown | null
}

export interface StaffProfile {
    staff_id: string
    company_id: string
    user_id: string
    email: string
    first_name: string
    last_name: string
    phone: string
    is_available: boolean
    is_Active: boolean
    skills: string[] | null
    created_at: string
    updated_at: string
    work_metrics: {
        total_hours_worked: string
        current_month_hours: string
    }
    next_confirmed_booking: {
        booking_id: string
        booking_number: string
        status: string
        scheduled_date: string // API usually returns string for dates
        scheduled_time_start: string
        scheduled_time_end: string | null
        service_location: string
        customer_name: string
        customer_phone: string | null
        service_name: string
        service_category: string
        total_amount: number
        hours_scheduled: number
    } | null
}

export type StaffDetails = StaffProfile

interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

interface ReadAllStaffResponse {
    success: boolean
    message: string
    data: {
        data: StaffMember[]
        pagination: PaginationMeta
    }
}

interface ReadStaffResponse {
    success: boolean
    status: number
    message: string
    code: string
    data: StaffDetails
    errors: unknown[]
}

interface ReadAllStaffQuery {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export const staffManagementApi = createApi({
    reducerPath: 'staffManagementApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Staff'],
    endpoints: (builder) => ({
        readAllStaff: builder.query<ReadAllStaffResponse['data'], ReadAllStaffQuery>({
            query: () => ({
                url: '/staff/read-all',
                method: 'GET',
                params: {
                    page: 1,
                    limit: 10,
                },
            }),
            transformResponse: (response: ReadAllStaffResponse) => response.data,
            providesTags: ['Staff']
        }),
        readStaff: builder.query<StaffDetails, string>({
            query: (staffId) => ({
                url: `/staff/read/${staffId}`,
                method: 'GET',
            }),
            transformResponse: (response: ReadStaffResponse) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Staff', id }]
        }),
        updateStaff: builder.mutation<unknown, { staffId: string; data: unknown }>({
            query: ({ staffId, data }) => ({
                url: `/staff/update/${staffId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { staffId }) => [{ type: 'Staff', id: staffId }, 'Staff'],
        }),
    }),
})

export const { useReadAllStaffQuery, useReadStaffQuery, useUpdateStaffMutation } = staffManagementApi
