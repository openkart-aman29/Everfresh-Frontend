
import { memo } from 'react'
import { format } from 'date-fns'
import {
    Clock, MapPin,
    Phone, Mail, DollarSign
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Booking } from '@/features/core/scheduler/interfaces/types'
import { useRescheduleBookingMutation } from '@/features/api/bookings/apis/BookingsAPI'
import { cn } from '@/lib/utils'
import { RescheduleModal } from './RescheduleModal'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

interface BookingInspectorProps {
    booking: Booking
    onClose: () => void
}

export const BookingInspector = memo(function BookingInspector({ booking, onClose }: BookingInspectorProps) {
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [rescheduleBooking, { isLoading: isRescheduling }] = useRescheduleBookingMutation()

    // --- Helpers & Mocks ---
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed': return { color: "bg-teal-100 text-teal-800", label: "Confirmed" }
            case 'pending': return { color: "bg-orange-100 text-orange-800", label: "Pending" }
            case 'cancelled': return { color: "bg-red-100 text-red-800", label: "Cancelled" }
            case 'rescheduled': return { color: "bg-blue-100 text-blue-800", label: "Rescheduled" }
            default: return { color: "bg-gray-100 text-gray-800", label: status }
        }
    }

    // Parse time strings manually to avoid Date parsing issues
    const getMinutes = (timeStr: string) => {
        if (!timeStr) return 0
        const [h, m] = timeStr.split(':').map(Number)
        return (h || 0) * 60 + (m || 0)
    }

    const durationMins = getMinutes(booking.scheduled_time_end) - getMinutes(booking.scheduled_time_start)


    const statusConfig = getStatusConfig(booking.status)

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* --- Header --- */}
            <div className="px-6 py-5 bg-background border-b sticky top-0 z-10">
                <div className="flex items-start justify-between mb-1">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Booking #{booking.booking_number}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {format(new Date(booking.scheduled_date), 'EEEE, MMMM do, yyyy')}
                        </p>
                    </div>
                    <Badge variant="secondary" className={cn("px-2.5 py-0.5 rounded-full font-semibold border-0", statusConfig.color)}>
                        {statusConfig.label}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* --- Customer Section --- */}
                <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Customer</h3>
                    <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                            {booking.customer_name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-base">{booking.customer_name}</div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Phone className="w-3.5 h-3.5" /> +971 55 123 4567
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Mail className="w-3.5 h-3.5" /> {booking.customer_name.toLowerCase().replace(' ', '')}@example.com
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Services Section --- */}
                <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Services</h3>
                    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-400 shrink-0" />
                                <div>
                                    <div className="font-semibold text-slate-900">{booking.service_name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{durationMins} mins × 1</div>
                                </div>
                            </div>
                            <div className="font-bold text-slate-900">{booking.total_amount}</div>
                        </div>
                        {/* Placeholder secondary service to match look */}
                        {/* <div className="flex items-start justify-between border-t border-slate-50 pt-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-400 shrink-0" />
                                <div>
                                    <div className="font-semibold text-slate-900">Add-on Service</div>
                                    <div className="text-xs text-slate-500 mt-0.5">30 mins × 1</div>
                                </div>
                            </div>
                            <div className="font-bold text-slate-900">AED 100</div>
                        </div> */}
                    </div>
                </section>

                {/* --- Time & Total --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Time</span>
                        </div>
                        <div className="font-bold text-slate-900 text-lg">
                            {booking.scheduled_time_start.slice(0, 5)} - {booking.scheduled_time_end.slice(0, 5)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">{durationMins} minutes</div>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
                        </div>
                        <div className="font-bold text-slate-900 text-lg">{booking.total_amount}</div>
                    </div>
                </div>

                {/* --- Location --- */}
                <div className="bg-white border rounded-xl p-4 shadow-sm flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Location</div>
                        <div className="font-medium text-slate-900">{booking.service_location}</div>
                    </div>
                </div>

                {/* --- Assigned Staff --- */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900">Staff Assignment</h3>
                    </div>

                    {booking.staff_name && typeof booking.staff_name === 'string' && booking.staff_name.trim() !== '' ? (
                        <div className="bg-white border rounded-xl p-3 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                    {booking.staff_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-900">{booking.staff_name}</div>
                                    <Badge variant="secondary" className="mt-0.5 h-5 px-1.5 text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800"
                                onClick={() => setIsRescheduleModalOpen(true)}
                            >
                                Reschedule
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4 border rounded-xl text-center text-sm mb-4 border-amber-200 bg-amber-50/50">
                            <div className="flex flex-col items-center gap-2 py-1">
                                <p className="text-amber-800 font-medium">
                                    No staff currently assigned
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setIsRescheduleModalOpen(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm mt-1"
                                >
                                    Reschedule
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                {/* --- Notes --- */}
                {/* <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                        <StickyNote className="w-4 h-4" /> Notes
                    </div>
                    <p className="text-sm text-amber-900/80 leading-relaxed font-medium">
                        Premium customer, ensure senior staff is assigned. Please check for allergies.
                    </p>
                </div> */}

            </div>

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                booking={booking}
                isLoading={isRescheduling}
                onConfirm={async (date, time) => {
                    try {
                        const [hours, minutes] = time.split(':').map(Number)
                        // Calculate end time
                        const startTotalMins = hours * 60 + minutes
                        const endTotalMins = startTotalMins + durationMins

                        const endHours = Math.floor(endTotalMins / 60)
                        const endMinutes = endTotalMins % 60
                        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

                        await rescheduleBooking({
                            booking_id: booking.booking_id,
                            new_scheduled_date: date.toISOString(),
                            new_scheduled_time_start: time,
                            new_scheduled_time_end: endTime
                        }).unwrap()

                        toast.success("Booking rescheduled successfully")
                        setIsRescheduleModalOpen(false)
                        onClose() // Close inspector too? Maybe keep open to show updated data.
                    } catch (error) {
                        toast.error("Failed to reschedule booking")
                        console.error("Reschedule failed", error)
                    }
                }}
            />
        </div >
    )
})
