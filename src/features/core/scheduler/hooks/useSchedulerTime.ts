import { useState, useEffect } from 'react'
import { START_HOUR, END_HOUR, TOTAL_MINUTES } from '@/features/core/scheduler/utils/scheduler.utils'

export const useSchedulerTime = () => {
    const [currentTimePercentage, setCurrentTimePercentage] = useState<number | null>(null)

    useEffect(() => {
        const calculatePosition = () => {
            const now = new Date()
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()

            // Check if current time is within scheduler bounds
            if (currentHour < START_HOUR || currentHour >= END_HOUR) {
                setCurrentTimePercentage(null)
                return
            }

            const minutesSinceStart = (currentHour * 60 + currentMinute) - (START_HOUR * 60)
            const percentage = (minutesSinceStart / TOTAL_MINUTES) * 100

            // Clamp percentage just in case
            const clamped = Math.max(0, Math.min(100, percentage))
            setCurrentTimePercentage(clamped)
        }

        // Initial calculation
        calculatePosition()

        // Update every minute
        const interval = setInterval(calculatePosition, 60000)

        return () => clearInterval(interval)
    }, [])

    return currentTimePercentage
}
