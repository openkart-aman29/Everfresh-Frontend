/**
 * Application constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Everfresh Admin'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        STAFF_SIGNIN: '/auth/signin',
        STAFF_SIGNOUT: '/auth/signout',
        STAFF_ROTATE_TOKEN: '/auth/rotate-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        SIGNUP_ADMIN: '/auth/signup/admin',
    },
    ADMIN: {
        READ_ALL: '/admin/read-all',
        READ: '/admin/read', // :adminId appended in API
        UPDATE: '/admin/update', // :adminId appended in API
    },
} as const

/**
 * Route paths
 */
export const ROUTES = {
    HOME: '/',
    SIGNIN: '/auth/signin',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    DASHBOARD: '/app/dashboard',
    ADMIN: '/app/admin',
} as const

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
    THEME: 'everfresh-theme',
    AUTH_STATE: 'persist:staffAuth',
} as const

/**
 * Token refresh buffer (seconds)
 */
export const TOKEN_REFRESH_BUFFER = 30
