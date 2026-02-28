import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { addDays, subDays, addWeeks, subWeeks, startOfWeek, isSameDay, isSameWeek } from 'date-fns'
import { useReadAllBookingsQuery } from '@/features/api/bookings/apis/BookingsAPI'
import { SchedulerHeader } from '@/features/core/scheduler/operations/view/components/SchedulerHeader'
import { TimeGrid } from '@/features/core/scheduler/operations/view/components/TimeGrid'
import { DayColumn } from '@/features/core/scheduler/operations/view/components/DayColumn'
import { SidePanel } from '@/components/ui/SidePanel'
import { BookingInspector } from '@/features/core/scheduler/operations/view/components/BookingInspector'
import type { SchedulerView, Booking } from '@/features/core/scheduler/interfaces/types'
import { useSSE } from '@/features/global/sse/hooks/useSSE'

export default function SchedulerPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<SchedulerView>('week')
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    // Fetch bookings from API
    const { data: bookings = [], isLoading, error, refetch } = useReadAllBookingsQuery()

    // Listen for real-time booking updates
    useSSE('booking_created', (data: any) => {
        try {
            const bookingDate = new Date(data.scheduled_date)
            let shouldRefetch = false

            if (view === 'day') {
                shouldRefetch = isSameDay(bookingDate, currentDate)
            } else {
                shouldRefetch = isSameWeek(bookingDate, currentDate, { weekStartsOn: 1 })
            }

            if (shouldRefetch) {
                console.log('New booking in view, refetching...', data)
                refetch()
            }
        } catch (err) {
            console.error('Error processing Booking Created event:', err)
        }
    })

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (view === 'day') {
            setCurrentDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1))
        } else {
            setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1))
        }
    }

    const handleToday = () => setCurrentDate(new Date())

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-8 text-muted-foreground">Loading scheduler...</div>
    }

    if (error) {
        return <div className="flex h-full items-center justify-center p-8 text-red-500">Failed to load bookings. Please try again.</div>
    }

    // console.log("from scheduler page", bookings)

    // Generate days to display
    const days = view === 'day'
        ? [currentDate]
        : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i))

    return (
        <div className="h-[calc(100vh-4rem)] p-4 bg-background">
            <Card className="h-full flex flex-col border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-0 border-b">
                    <SchedulerHeader
                        currentDate={currentDate}
                        view={view}
                        onViewChange={setView}
                        onNavigate={handleNavigate}
                        onToday={handleToday}
                    />
                </CardHeader>

                <CardContent className="p-0 flex flex-1 overflow-hidden relative">
                    <div className="flex-1 overflow-auto">
                        <div
                            className="grid min-w-[800px]"
                            style={{
                                gridTemplateColumns: `64px repeat(${days.length}, 1fr)`
                            }}
                        >
                            {/* Column 1: Time Grid */}
                            <div className="sticky left-0 z-40 bg-background border-r">
                                <TimeGrid />
                            </div>

                            {/* Columns 2..n: Days */}
                            {days.map((date) => (
                                <DayColumn
                                    key={date.toISOString()}
                                    date={date}
                                    bookings={bookings}
                                    onBookingClick={setSelectedBooking}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <SidePanel
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
            >
                {selectedBooking && (
                    <BookingInspector
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                    />
                )}
            </SidePanel>
        </div>
    )
}
