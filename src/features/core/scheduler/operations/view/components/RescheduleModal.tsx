import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Booking } from '@/features/core/scheduler/interfaces/types'
import { START_HOUR, END_HOUR } from '@/features/core/scheduler/utils/scheduler.utils'

// Import default styles for DayPicker if not globally available, 
// or use a wrapper class. For now, we'll try to style it minimally or assume global styles.
import 'react-day-picker/style.css'

interface RescheduleModalProps {
    isOpen: boolean
    onClose: () => void
    booking: Booking
    startTime?: string // Optional initial time
    onConfirm: (newDate: Date, newTime: string) => void
    isLoading?: boolean
}

export function RescheduleModal({ isOpen, onClose, booking, onConfirm, isLoading = false }: RescheduleModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(booking.scheduled_date))
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)

    // Generate time slots
    const timeSlots = useMemo(() => {
        const slots = []
        for (let h = START_HOUR; h < END_HOUR; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }, [])



    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            onConfirm(selectedDate, selectedTime)
            onClose()
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full">

                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            Reschedule Booking
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-slate-500">
                            Please choose a new time slot for this booking.
                        </Dialog.Description>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Date Selection */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-slate-500" /> Select Date
                            </h4>
                            <div className="border rounded-md p-2 flex justify-center bg-slate-50/50">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={{ before: new Date() }}
                                    modifiersClassNames={{
                                        selected: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                                    }}
                                    className="p-0"
                                />
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" /> Select Time
                            </h4>
                            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2">
                                {timeSlots.map(time => {
                                    const isSelected = selectedTime === time
                                    return (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            disabled={isLoading}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-2 rounded-md border text-sm transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                                                isLoading && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <span className={cn("font-medium", isSelected ? "text-primary" : "text-slate-700")}>
                                                {time}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 border-t pt-4">
                        <div className="text-xs text-slate-500 font-medium">
                            Current: <span className="text-slate-700">{format(new Date(booking.scheduled_date), 'MMM d')} at {booking.scheduled_time_start.slice(0, 5)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Dialog.Close asChild>
                                <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                            </Dialog.Close>
                            <Button
                                type="button"
                                disabled={!selectedTime || !selectedDate || isLoading}
                                onClick={handleConfirm}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
                            </Button>
                        </div>
                    </div>

                    <Dialog.Close asChild>
                        <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
