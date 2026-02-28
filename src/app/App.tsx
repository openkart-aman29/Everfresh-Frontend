import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler'

export default function App() {
    return (
        <ThemeProvider>
            <GlobalErrorHandler />
            <Toaster richColors position="top-right" closeButton />
            <Outlet />
        </ThemeProvider>
    )
}
