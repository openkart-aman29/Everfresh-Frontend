import { memo } from 'react'
import { format, isToday } from 'date-fns'
import type { Booking } from '@/features/core/scheduler/interfaces/types'
import { getBookingsForDate, generateTimeSlots, calculateDailyLayout, SLOT_HEIGHT, TOTAL_MINUTES } from '@/features/core/scheduler/utils/scheduler.utils'
import { useSchedulerTime } from '@/features/core/scheduler/hooks/useSchedulerTime'
import { BookingCard } from './BookingCard'
import { cn } from '@/lib/utils'

interface DayColumnProps {
    date: Date
    bookings: Booking[]
    onBookingClick?: (booking: Booking) => void
}

export const DayColumn = memo(function DayColumn({ date, bookings, onBookingClick }: DayColumnProps) {
    const slots = generateTimeSlots()
    const dayBookings = getBookingsForDate(bookings, date)
    const layoutItems = calculateDailyLayout(dayBookings)
    const isCurrentDay = isToday(date)
    const currentTimePercentage = useSchedulerTime()

    return (
        <div className={cn(
            "flex-1 min-w-[150px] border-r relative flex flex-col",
            isCurrentDay && "bg-primary/5"
        )}>
            {/* Day Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b h-14 flex items-center justify-center shadow-sm flex-col">
                <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">
                    {format(date, 'EEE')}
                </div>
                <div className={cn(
                    "text-xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-full mx-auto transition-colors",
                    isCurrentDay && "bg-primary text-primary-foreground shadow-sm"
                )}>
                    {format(date, 'd')}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="relative flex-1 overflow-visible">
                {/* Background Grid - CSS Grid Upgrade */}
                <div
                    className="absolute inset-0 grid"
                    style={{
                        gridTemplateRows: `repeat(${TOTAL_MINUTES / 60}, ${SLOT_HEIGHT}px)`
                    }}
                >
                    {slots.map((_, i) => (
                        <div key={i} className="border-b border-muted/10 w-full" />
                    ))}
                </div>

                {/* Current Time Indicator (if today) */}
                {isCurrentDay && currentTimePercentage !== null && (
                    <div
                        className="absolute w-full border-t-2 border-primary z-20 pointer-events-none flex items-center"
                        style={{ top: `${currentTimePercentage}%` }}
                    >
                        <div className="h-2 w-2 rounded-full bg-primary absolute -left-1 shadow-sm ring-1 ring-white" />
                    </div>
                )}

                {/* Booking Cards Area */}
                <div className="relative w-full" style={{ height: (TOTAL_MINUTES / 60) * SLOT_HEIGHT }}>
                    {layoutItems.map(({ booking, style }) => (
                        <BookingCard
                            key={booking.booking_id}
                            booking={booking}
                            layoutStyle={style}
                            onClick={onBookingClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
})
