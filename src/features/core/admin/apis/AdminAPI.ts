import { createApi } from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '@/lib/constants'
import { baseQueryWithReauth } from '@/api/baseQuery'
import type { CreateAdminSchema } from '@/features/core/admin/operations/create/schemas/CreateAdminSchema'

export interface AdminUser {
    admin_id: string
    user_id: string
    company_id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    is_active: boolean
    email_verified: boolean
    phone_verified: boolean
    last_login: string
    created_at: string
    updated_at: string
    roles: string[]
}

interface ReadAllAdminsResponse {
    success: boolean
    message: string
    data: {
        data: AdminUser[]
        pagination: {
            page: number
            limit: number
            totalRecords: number
            totalPages: number
        }
    }
}

interface CreateAdminResponse {
    success: boolean
    message: string
    data: AdminUser
}

import type { UpdateAdminSchema } from '@/features/core/admin/operations/update/schemas/UpdateAdminSchema'

// ... existing types ...

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Admin'],
    endpoints: (builder) => ({
        readAllAdmins: builder.query<ReadAllAdminsResponse, { company_id?: string } | void>({
            query: (params) => ({
                url: params?.company_id
                    ? `${API_ENDPOINTS.ADMIN.READ_ALL}?company_id=${params.company_id}`
                    : API_ENDPOINTS.ADMIN.READ_ALL,
                method: 'GET',
            }),
            providesTags: ['Admin'],
        }),
        readAdmin: builder.query<{ success: boolean, data: AdminUser }, string>({
            query: (adminId) => ({
                url: `${API_ENDPOINTS.ADMIN.READ}/${adminId}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Admin', id }],
        }),
        createAdmin: builder.mutation<CreateAdminResponse, CreateAdminSchema>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.SIGNUP_ADMIN,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Admin'],
        }),
        updateAdmin: builder.mutation<{ success: boolean, message: string }, { adminId: string, data: UpdateAdminSchema }>({
            query: ({ adminId, data }) => ({
                url: `${API_ENDPOINTS.ADMIN.UPDATE}/${adminId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { adminId }) => ['Admin', { type: 'Admin', id: adminId }],
        }),
    }),
})

export const { useReadAllAdminsQuery, useCreateAdminMutation, useReadAdminQuery, useUpdateAdminMutation } = adminApi
