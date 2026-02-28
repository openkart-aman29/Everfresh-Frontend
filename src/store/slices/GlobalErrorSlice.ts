import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ErrorState {
    message: string | null
    status?: number | null
}

const initialState: ErrorState = {
    message: null,
    status: null,
}

const globalErrorSlice = createSlice({
    name: 'globalError',
    initialState,
    reducers: {
        setGlobalError: (state, action: PayloadAction<{ message: string; status?: number }>) => {
            state.message = action.payload.message
            state.status = action.payload.status
        },
        clearGlobalError: (state) => {
            state.message = null
            state.status = null
        },
    },
})

export const { setGlobalError, clearGlobalError } = globalErrorSlice.actions
export default globalErrorSlice.reducer
