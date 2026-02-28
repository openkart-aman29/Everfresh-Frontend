import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/api/baseQuery'

export interface DashboardMetrics {
    total_bookings: number
    total_bookings_change_percent: number
    revenue: number
    revenue_change_percent: number
    wait_list: number
    wait_list_change_percent: number
    active_agents: number
    active_agents_change: number
    completed_bookings: number
    pending_bookings: number
    confirmed_bookings: number
    cancelled_bookings: number
}

export interface CompanyDetails {
    company_id: string
    company_name: string
    slug: string
    email: string
    phone: string
    address: string
    logo_url: string | null
    subscription_tier: string
    is_active: boolean
    settings: Record<string, unknown> | null
    timezone: string
    currency: string
    created_at: string
    updated_at: string
    dashboard_metrics: DashboardMetrics
}

export interface CreateCompanyRequest {
    company_name: string
    slug?: string
    email: string
    phone: string
    address: string
    logo_url?: string | null
    subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise' | null
}

export interface UpdateCompanyRequest {
    company_name: string
    slug: string
    email: string | null
    phone: string | null
    address: string | null
    logo_url: string | null
    subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise' | null
    is_active: boolean
}

interface ReadCompanyResponse {
    success: boolean
    status: number
    message: string
    code: string
    data: CompanyDetails
    errors: unknown[]
}

interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

interface ReadAllCompaniesResponse {
    success: boolean
    status: number
    message: string
    code: string
    data: {
        data: CompanyDetails[]
        pagination: PaginationMeta
    }
    errors: unknown[]
}

interface ReadAllCompaniesQuery {
    page?: number
    limit?: number
    search?: string
}

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Company'],
    endpoints: (builder) => ({
        readCompany: builder.query<CompanyDetails, string>({
            query: (companyId) => ({
                url: `/companies/read/${companyId}`,
                method: 'GET',
            }),
            transformResponse: (response: ReadCompanyResponse) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Company', id }]
        }),
        readAllCompanies: builder.query<ReadAllCompaniesResponse['data'], ReadAllCompaniesQuery>({
            query: (params) => ({
                url: '/companies/read-all',
                method: 'GET',
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    search: params.search,
                },
            }),
            transformResponse: (response: ReadAllCompaniesResponse) => response.data,
            providesTags: ['Company'],
        }),
        createCompany: builder.mutation<unknown, CreateCompanyRequest>({
            query: (data) => ({
                url: '/companies/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Company'],
        }),
        updateCompany: builder.mutation<unknown, { companyId: string; data: UpdateCompanyRequest }>({
            query: ({ companyId, data }) => ({
                url: `/companies/update/${companyId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: companyId }, 'Company'],
        }),
    }),
})

export const { useReadCompanyQuery, useReadAllCompaniesQuery, useUpdateCompanyMutation, useCreateCompanyMutation } = companyApi
