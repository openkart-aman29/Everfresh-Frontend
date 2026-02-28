import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface SidePanelProps {
    isOpen: boolean
    onClose: () => void
    title?: React.ReactNode
    children: React.ReactNode
    className?: string
}

export function SidePanel({ isOpen, onClose, title, children, className }: SidePanelProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background shadow-2xl p-0",
                            className
                        )}
                    >
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <div className="text-lg font-semibold">{title}</div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
