import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format as formatDateFns } from 'date-fns'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format date using date-fns
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
    return formatDateFns(new Date(date), formatStr)
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
