import { memo } from 'react'
import type { Booking } from '@/features/core/scheduler/interfaces/types'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'


interface BookingCardProps {
    booking: Booking
    layoutStyle: {
        top: string
        height: string
        left: string
        width: string
    }
    onClick?: (booking: Booking) => void
}

const statusIndicatorColor = {
    pending: 'bg-teal-500',
    confirmed: 'bg-green-500',
    cancelled: 'bg-red-400',
    rescheduled: 'bg-blue-500'
}

export const BookingCard = memo(function BookingCard({ booking, layoutStyle, onClick }: BookingCardProps) {
    // console.log("from booking Card", booking)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "absolute p-1 rounded-md border text-xs cursor-pointer hover:brightness-95 transition-all overflow-hidden",
                // Status colors...
                booking.status === 'confirmed' && "bg-emerald-100/80 border-emerald-200 text-emerald-900",
                booking.status === 'pending' && "bg-orange-100 border-orange-200 text-orange-800",
                booking.status === 'cancelled' && "bg-red-50 border-red-100 text-red-700 decoration-slice",
                booking.status === 'rescheduled' && "bg-blue-50 border-blue-100 text-blue-800 decoration-slice",

                // Unassigned / Reschedule Warning
                // If confirmed/pending but NO staff -> warning state
                !booking.staff_name && booking.status !== 'cancelled' && "bg-amber-50 border-amber-300 text-amber-900 shadow-sm"
            )}
            style={{
                top: layoutStyle.top,
                height: layoutStyle.height,
                left: layoutStyle.left,
                width: layoutStyle.width,
                zIndex: 10 // Ensure it sits above grid lines
            }}
            onClick={() => onClick?.(booking)}
        >
            <div className="flex items-center gap-1.5 font-semibold leading-tight truncate">
                <div className={cn("h-2 w-2 rounded-full shrink-0",
                    !booking.staff_name ? "bg-amber-500 animate-pulse" : statusIndicatorColor[booking.status]
                )} />
                {booking.customer_name}
            </div>

            <div className="truncate text-[10px] opacity-80 font-medium pb-0.5">
                {booking.service_name}
            </div>

            <div className="flex items-center justify-between text-[9px] opacity-80 mt-auto">
                <span>{booking.scheduled_time_start.slice(0, 5)}</span>
                {!booking.staff_name && (
                    <span className="font-bold text-amber-700 bg-amber-200/50 px-1 rounded-[2px] text-[8px] uppercase tracking-wide">
                        Needs Reschedule
                    </span>
                )}
            </div>
        </motion.div>
    )
})
