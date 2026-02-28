export interface Staff {
    staff_id: string
    user_id: string
    company_id: string
    email: string
    first_name: string
    last_name: string
    phone: string
    staff_code: string
    position: string
    department: string
    is_available: boolean
    employment_type: string
}

export interface AuthUser {
    user_id: string
    company_id: string
    email: string
    first_name: string
    last_name: string
    phone: string
    is_active: boolean
    email_verified: boolean
    roles: string[]
    domain_id: string | null
    domain_type: string
    created_at: string
}

export interface User {
    id: string
    email: string
    // Add other user fields if necessary
}
