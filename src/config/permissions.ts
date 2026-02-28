export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    STAFF: 'staff',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        canViewDashboard: false,
        canViewScheduler: false,
        canViewStaff: false,
        canViewAdmin: true,
        canViewCustomers: false,
    },
    [ROLES.ADMIN]: {
        canViewDashboard: true,
        canViewScheduler: true,
        canViewStaff: true,
        canViewAdmin: false,
        canViewCustomers: true,
    },
    [ROLES.STAFF]: {
        canViewDashboard: false,
        canViewScheduler: false,
        canViewStaff: false, // Can only view own profile
        canViewAdmin: false,
        canViewCustomers: false,
    },
}
