import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AlertCircle, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useAppSelector } from '@/store/useStoreHook'
import { useCreateBookingMutation } from '@/features/api/bookings/apis/BookingsAPI'
import {
    useReadAllCustomersQuery,
    useReadAllServicesQuery,
} from '@/features/api/resources/apis/ResourcesAPI'

interface CreateBookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Day the scheduler is currently showing, used as the default date. */
    defaultDate?: Date
}

/** Adds `minutes` to a "HH:mm" string, wrapping is not expected within a work day. */
function addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number)
    const total = h * 60 + m + minutes
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    return `${hh}:${mm}`
}

export default function CreateBookingDialog({
    open,
    onOpenChange,
    defaultDate,
}: CreateBookingDialogProps) {
    const companyId = useAppSelector((state) => state.staffAuth.user?.company_id)

    // Reference data is only worth fetching once the dialog is actually opened.
    const { data: customers = [], isLoading: loadingCustomers } = useReadAllCustomersQuery(undefined, {
        skip: !open,
    })
    const { data: services = [], isLoading: loadingServices } = useReadAllServicesQuery(undefined, {
        skip: !open,
    })

    const [createBooking, { isLoading: submitting }] = useCreateBookingMutation()

    const [customerId, setCustomerId] = useState('')
    const [serviceId, setServiceId] = useState('')
    const [date, setDate] = useState(format(defaultDate ?? new Date(), 'yyyy-MM-dd'))
    const [startTime, setStartTime] = useState('09:00')
    const [location, setLocation] = useState('')
    const [instructions, setInstructions] = useState('')
    const [formError, setFormError] = useState<string | null>(null)

    const selectedService = useMemo(
        () => services.find((s) => s.service_id === serviceId),
        [services, serviceId]
    )

    // End time is derived from the service duration so the caller never has to
    // reason about it; the backend accepts it as optional either way.
    const endTime = useMemo(
        () => addMinutesToTime(startTime, selectedService?.duration_minutes ?? 60),
        [startTime, selectedService]
    )

    const reset = () => {
        setCustomerId('')
        setServiceId('')
        setStartTime('09:00')
        setLocation('')
        setInstructions('')
        setFormError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        if (!companyId) {
            setFormError('Your account is not linked to a company, so bookings cannot be created.')
            return
        }
        if (!customerId) return setFormError('Please choose a customer.')
        if (!serviceId) return setFormError('Please choose a service.')
        // Matches the backend's own minimum, so the error surfaces before the request.
        if (location.trim().length < 10) {
            return setFormError('Service location must be at least 10 characters.')
        }

        try {
            const booking = await createBooking({
                company_id: companyId,
                customer_id: customerId,
                service_id: serviceId,
                scheduled_date: date,
                scheduled_time_start: startTime,
                scheduled_time_end: endTime,
                service_location: location.trim(),
                quantity: 1,
                special_instructions: instructions.trim() || null,
            }).unwrap()

            toast.success(`Booking ${booking.booking_number ?? ''} created`.trim())
            reset()
            onOpenChange(false)
        } catch (err) {
            const apiError = err as { data?: { errors?: Array<{ message: string }>; message?: string } }
            setFormError(
                apiError?.data?.errors?.[0]?.message ??
                    apiError?.data?.message ??
                    'Could not create the booking. Please try again.'
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarPlus className="h-4 w-4" />
                        New Booking
                    </DialogTitle>
                    <DialogDescription>
                        Staff is auto-assigned by availability, and pricing comes from the service.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <select
                            id="customer"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">
                                {loadingCustomers ? 'Loading customers...' : 'Select a customer'}
                            </option>
                            {customers.map((c) => (
                                <option key={c.customer_id} value={c.customer_id}>
                                    {c.first_name} {c.last_name} — {c.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="service">Service</Label>
                        <select
                            id="service"
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">
                                {loadingServices ? 'Loading services...' : 'Select a service'}
                            </option>
                            {services.map((s) => (
                                <option key={s.service_id} value={s.service_id}>
                                    {s.service_name} — {s.currency ?? 'AED'} {s.price}
                                    {s.pricing_type === 'hourly' ? '/hr' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">
                                Start time
                                <span className="ml-2 font-normal text-muted-foreground">ends {endTime}</span>
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Service location</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Villa 12, Oud Metha, Dubai"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Special instructions (optional)</Label>
                        <textarea
                            id="instructions"
                            rows={2}
                            value={instructions}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setInstructions(e.target.value)
                            }
                            placeholder="Anything the team should know"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        />
                    </div>

                    {formError && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {formError}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create booking'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
