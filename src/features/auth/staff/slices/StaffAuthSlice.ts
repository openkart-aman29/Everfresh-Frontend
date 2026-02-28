import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/features/auth/staff/interfaces/StaffInterface'

export interface AuthState {
    isAuthenticated: boolean
    accessToken: string | null
    user: AuthUser | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    user: null,
    loading: false,
    error: null,
}

const staffAuthSlice = createSlice({
    name: 'staffAuth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ accessToken: string; user: AuthUser }>
        ) => {
            state.isAuthenticated = true
            state.accessToken = action.payload.accessToken
            state.user = action.payload.user
            state.loading = false
            state.error = null
        },
        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        logout: (state) => {
            state.isAuthenticated = false
            state.accessToken = null
            state.user = null
            state.error = null
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
    },
})

export const { setCredentials, updateAccessToken, logout, setLoading, setError } = staffAuthSlice.actions
export default staffAuthSlice.reducer
