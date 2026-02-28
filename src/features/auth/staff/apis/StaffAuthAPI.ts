import { createApi } from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '@/lib/constants'
import { type SignInSchema } from '@/features/auth/staff/operations/sign_in/zod_schemas/SignInZodSchema'
import { baseQueryWithReauth } from '@/api/baseQuery'
import { type AuthUser } from '@/features/auth/staff/interfaces/StaffInterface'

// Define request/response types if needed locally
interface SignInResponse {
    success: boolean
    message: string
    data: {
        accessToken: string
        user: AuthUser
    }
}

interface RotateResponse {
    success: boolean
    data: {
        accessToken: string
    }
}

interface ForgotPasswordResponse {
    success: boolean
    message: string
}

interface ResetPasswordResponse {
    success: boolean
    message: string
}

interface ForgotPasswordRequest {
    email: string
}

interface ResetPasswordRequest {
    resetToken: string
    newPassword: string
    confirmPassword: string
}

export const staffAuthApi = createApi({
    reducerPath: 'staffAuthApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        signIn: builder.mutation<SignInResponse, SignInSchema>({
            query: (credentials) => ({
                url: API_ENDPOINTS.AUTH.STAFF_SIGNIN,
                method: 'POST',
                body: credentials,
            }),
        }),
        signup: builder.mutation<unknown, unknown>({
            query: (data) => ({
                url: '/auth/signup/staff', // Hardcoding for now as requested, or add to constants if preferred
                method: 'POST',
                body: data,
            }),
        }),
        signOut: builder.mutation<void, void>({
            query: () => ({
                url: API_ENDPOINTS.AUTH.STAFF_SIGNOUT,
                method: 'POST',
            }),
        }),
        rotateToken: builder.mutation<RotateResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.AUTH.STAFF_ROTATE_TOKEN,
                method: 'POST',
            }),
        }),
        forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),
    }),
})

export const { useSignInMutation, useSignOutMutation, useRotateTokenMutation, useSignupMutation, useForgotPasswordMutation, useResetPasswordMutation } = staffAuthApi
