import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import type { RootState } from '@/store/Store'
import { clearGlobalError } from '@/store/slices/GlobalErrorSlice'

export const GlobalErrorHandler = () => {
    const dispatch = useDispatch()
    const { message, status } = useSelector((state: RootState) => state.globalError)

    useEffect(() => {
        if (message) {
            toast.error(message, {
                description: status ? `Status Code: ${status}` : undefined,
                duration: 5000,
                onDismiss: () => dispatch(clearGlobalError()),
                onAutoClose: () => dispatch(clearGlobalError()),
            })
            // Clear immediately after showing toast so it doesn't persist if component remounts
            // But we might want to wait for dismiss? 
            // Actually, sonner doesn't strictly need us to clear generic state, 
            // but for Redux state it's good practice to clear it once consumed.
            dispatch(clearGlobalError())
        }
    }, [message, status, dispatch])

    return null
}
