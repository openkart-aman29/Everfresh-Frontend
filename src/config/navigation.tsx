import {
    LayoutDashboard,
    Calendar,
    UserCircle,
    Building2,
} from 'lucide-react'
import { ROLES } from './permissions'

export interface NavItem {
    label: string
    icon: React.ElementType
    path: string
    allowedRoles: string[]
}

export const MAIN_NAV: NavItem[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/app/dashboard',
        allowedRoles: [ROLES.ADMIN],
    },
    {
        label: 'Scheduler',
        icon: Calendar,
        path: '/app/scheduler',
        allowedRoles: [ROLES.ADMIN],
    },
]

export const PEOPLE_NAV: NavItem[] = [
    {
        label: 'Staff',
        icon: UserCircle,
        path: '/app/staff',
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
        // Note: For 'staff' role, this link might need to be dynamically rewritten 
        // or the page itself handles redirection to own profile. 
        // Based on user request, staff should only see "Staff" page which is their own profile.
        // We will handle specific redirection in the component or router.
    },
]

export const SYSTEM_NAV: NavItem[] = [
    {
        label: 'Companies',
        icon: Building2,
        path: '/app/companies',
        allowedRoles: [ROLES.SUPER_ADMIN],
    },
]
