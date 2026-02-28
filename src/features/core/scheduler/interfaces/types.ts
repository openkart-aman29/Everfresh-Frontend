export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled'

export interface Booking {
    booking_id: string
    booking_number: string
    status: BookingStatus
    scheduled_date: string // ISO date string (YYYY-MM-DD)
    scheduled_time_start: string // HH:mm:ss
    scheduled_time_end: string // HH:mm:ss
    customer_name: string
    service_name: string
    service_category: string
    service_location: string
    total_amount: number
    staff_name: string
}

export type SchedulerView = 'day' | 'week'
