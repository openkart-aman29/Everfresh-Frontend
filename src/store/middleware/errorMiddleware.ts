import { isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import { setGlobalError } from '@/store/slices/GlobalErrorSlice'

export const rtkQueryErrorLogger: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        // action.payload is the error object
        const payload = action.payload as any
        let message = 'An unexpected error occurred'
        let status = null

        if (payload?.status) {
            status = payload.status
        }

        // Prioritize detailed error messages from validation (e.g., Zod)
        if (payload?.data?.errors?.[0]?.message) {
            message = payload.data.errors[0].message
        } else if (payload?.data?.message) {
            // Fallback to top-level message (e.g., "INVALID_CREDENTIALS")
            message = payload.data.message
        } else if (payload?.error) {
            message = payload.error
        }

        // Dispatch global error for ALL errors, including 401s
        api.dispatch(setGlobalError({ message, status }))
    }

    return next(action)
}
