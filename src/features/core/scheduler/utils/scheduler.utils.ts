import {
    format,
    addMinutes
} from 'date-fns'
import type { Booking } from '@/features/core/scheduler/interfaces/types'

// Constants
export const START_HOUR = 8 // 8 AM
export const END_HOUR = 20 // 8 PM
export const SLOT_DURATION = 60 // Minutes
export const SLOT_HEIGHT = 100 // Pixels to allow more space
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

/**
 * Generates time slots for the grid axis
 */
export const generateTimeSlots = () => {
    const slots = []
    let currentTime = new Date()
    currentTime.setHours(START_HOUR, 0, 0, 0)

    const endTime = new Date()
    endTime.setHours(END_HOUR, 0, 0, 0)

    while (currentTime <= endTime) {
        slots.push(format(currentTime, 'HH:mm'))
        currentTime = addMinutes(currentTime, SLOT_DURATION)
    }
    return slots
}

/**
 * Filters bookings for a specific date using local-time aware parsing.
 * This ensures that a UTC timestamp (e.g. T20:00:00Z) counts as the *next day*
 * if the local user is in a timezone like Dubai (UTC+4).
 */
export const getBookingsForDate = (bookings: Booking[], date: Date) => {
    if (!Array.isArray(bookings)) return []
    const targetDateStr = format(date, 'yyyy-MM-dd')

    return bookings.filter(b => {
        // Parse the UTC string into a local Date object
        // e.g. "2026-02-04T20:00:00Z" -> "2026-02-05 00:00:00+04" (in Dubai)
        const bookingDate = new Date(b.scheduled_date)
        const bookingDateStr = format(bookingDate, 'yyyy-MM-dd')

        return bookingDateStr === targetDateStr
    })
}

/**
 * Calculates the visual position for a booking
 */
export const calculateBookingPosition = (booking: Booking) => {
    const startParts = booking.scheduled_time_start.split(':').map(Number) // [13, 00, 00]
    const endParts = booking.scheduled_time_end.split(':').map(Number)

    // Minutes from 8:00 AM
    const startMinutes = (startParts[0] * 60 + startParts[1]) - (START_HOUR * 60)
    const endMinutes = (endParts[0] * 60 + endParts[1]) - (START_HOUR * 60)

    const heightMinutes = endMinutes - startMinutes

    // Clamp values
    const safeStart = Math.max(0, Math.min(startMinutes, TOTAL_MINUTES))
    const actualHeight = Math.max(0, Math.min(heightMinutes, TOTAL_MINUTES - safeStart))

    const top = (safeStart / TOTAL_MINUTES) * 100
    const height = (actualHeight / TOTAL_MINUTES) * 100

    return { top: `${top}%`, height: `${height}%` }
}

export interface BookingLayout {
    booking: Booking
    style: {
        top: string
        height: string
        left: string
        width: string
    }
}

/**
 * Calculates layout for all bookings in a day to handle overlaps
 */
export const calculateDailyLayout = (bookings: Booking[]): BookingLayout[] => {
    // 1. Sort by start time, then duration (longer first)
    const sorted = [...bookings].sort((a, b) => {
        if (a.scheduled_time_start !== b.scheduled_time_start) {
            return a.scheduled_time_start.localeCompare(b.scheduled_time_start)
        }
        return b.scheduled_time_end.localeCompare(a.scheduled_time_end) // Longer duration preferred?
    })

    // 2. Compute abstract positions (start/end in minutes)
    const items = sorted.map(b => {
        const pos = calculateBookingPosition(b)
        // Reverse calc minutes for collision detection
        const topPc = parseFloat(pos.top)
        const heightPc = parseFloat(pos.height)
        return {
            booking: b,
            start: topPc,
            end: topPc + heightPc,
            baseStyle: pos
        }
    })

    // Simple overlapping columns algorithm
    // We place items into "columns" where items in the same column don't overlap vertically
    // This is NOT the "pack" algorithm (like GCal) but a simpler "columnize" one.
    // For GCal style: simple approach → Find max concurrency for a time block.

    // Better GCal style approach:
    // Expand width for an item if it doesn't collide with neighbors?
    // Let's implement a standard "Max Concurrent" algorithm.

    // We will assign a "column index" to each event.
    // Events colliding with each other must have different column indices.

    // Array of "tracks" (columns). Each track has an end time of its last event.
    // This is essentially "packing" logic.
    type VisualItem = typeof items[0] & { colIndex: number, maxCols: number }
    const visualItems: VisualItem[] = []

    // We process clusters of interacting events
    // But for simplicity in this pass:
    // We just find how many items overlap at any given point for an item to determine its width (1/N)
    // And its index (0..N-1) determines left (i/N).

    // Simple greedy packing:
    // Place item in first available column (track)
    const tracks: number[] = [] // stores end time of last event in this track

    items.forEach(item => {
        let placed = false
        // Try to find a track where this item fits (starts after track ends)
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i] <= item.start) {
                tracks[i] = item.end
                visualItems.push({ ...item, colIndex: i, maxCols: 0 }) // maxCols unknown yet
                placed = true
                break
            }
        }

        if (!placed) {
            // New track needed
            tracks.push(item.end)
            visualItems.push({ ...item, colIndex: tracks.length - 1, maxCols: 0 })
        }
    })

    // Now determine "maxCols" (width) for each group of overlapping items.
    // Actually, width should be 1 / (max overlaps in this cluster).
    // This simple track packing isn't quite enough for perfect "expand to fill", 
    // but ensures they don't overlap.
    // We need to know the max columns active during the item's time window.

    return visualItems.map(item => {
        // Find how many items overlap with this one
        // (Crude O(N^2) but N is small per day)
        const overlaps = visualItems.filter(other =>
            item !== other &&
            Math.max(item.start, other.start) < Math.min(item.end, other.end)
        )

        // This effectively gives us a "cluster".
        // The width should be 1 / (max concurrent items in the cluster).
        // Let's approximate: max colIndex reached in this group + 1 ??
        // Or strictly: Max concurrency during this event.

        // Simple approach: width = 1 / tracks.length (too narrow if sparse)
        // Better: width = 1 / (max(colIndex) + 1) of the conflicting group ??
        // Let's stick to safe width: 100% / tracks.length? No, that shrinks everything.

        // Let's recalculate maxCols just for this cluster.
        let localMaxCols = item.colIndex + 1
        overlaps.forEach(o => {
            localMaxCols = Math.max(localMaxCols, o.colIndex + 1)
        })

        // Width %
        const width = 100 / localMaxCols
        const left = item.colIndex * width

        return {
            booking: item.booking,
            style: {
                top: item.baseStyle.top,
                height: item.baseStyle.height,
                left: `${left}%`,
                width: `${width}%`
            }
        }
    })
}
