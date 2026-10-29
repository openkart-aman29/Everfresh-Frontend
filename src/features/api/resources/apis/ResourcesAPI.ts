import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/api/baseQuery'

/** Reference data the booking form needs: who to book for, and what. */

export interface CustomerOption {
    customer_id: string
    company_id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
}

export interface ServiceOption {
    service_id: string
    company_id: string
    service_name: string
    category: string | null
    price: string
    currency: string | null
    pricing_type: string
    duration_minutes: number | null
    requires_quote: boolean
}

interface StandardResponse<T> {
    success: boolean
    status: number
    message: string
    code: string
    data: T
    errors: Array<{ field: string; message: string }>
}

export const resourcesApi = createApi({
    reducerPath: 'resourcesApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        readAllCustomers: builder.query<CustomerOption[], void>({
            query: () => 'customers/read-all?limit=100',
            transformResponse: (r: StandardResponse<{ customers: CustomerOption[] }>) =>
                r.data.customers,
        }),
        readAllServices: builder.query<ServiceOption[], void>({
            query: () => 'services/read-all',
            transformResponse: (r: StandardResponse<{ services: ServiceOption[] }>) => r.data.services,
        }),
    }),
})

export const { useReadAllCustomersQuery, useReadAllServicesQuery } = resourcesApi
