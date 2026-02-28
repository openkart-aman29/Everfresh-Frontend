import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants'
import { logout, updateAccessToken } from '@/features/auth/staff/slices/StaffAuthSlice'
import type { RootState } from '@/store/Store'

// Create a Mutex to prevent multiple refresh calls appropriately
const mutex = new Mutex()

interface RotateResponse {
    success: boolean
    data: {
        accessToken: string
    }
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).staffAuth.accessToken
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
})

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock()

    let result = await baseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        // Only try to refresh if it's NOT the signin or rotate endpoint itself to avoid loops
        // (Though simple 401 check usually suffices if rotate endpoint returns non-401 on failure)

        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                // Call rotate token endpoint
                const refreshResult = await baseQuery(
                    {
                        url: API_ENDPOINTS.AUTH.STAFF_ROTATE_TOKEN,
                        method: 'POST',
                    },
                    api,
                    extraOptions
                )

                if (refreshResult.data) {
                    const data = refreshResult.data as RotateResponse
                    if (data.success && data.data.accessToken) {
                        // Store the new token
                        api.dispatch(updateAccessToken(data.data.accessToken))

                        // Retry the initial query
                        result = await baseQuery(args, api, extraOptions)
                    } else {
                        // Rotation returned success: false? Treat as failure.
                        api.dispatch(logout())
                    }
                } else {
                    // Refresh failed (e.g. 401/403/500)
                    api.dispatch(logout())
                }
            } finally {
                // release must be called once the mutex should be released again.
                release()
            }
        } else {
            // wait until the mutex is available without locking it
            await mutex.waitForUnlock()
            // retry the initial query
            result = await baseQuery(args, api, extraOptions)
        }
    }
    return result
}
