import { z } from "zod";

export const ulidZodSchema = z.string()
    .length(26, "ULID must be exactly 26 characters")
    .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/i, "Invalid ULID format");

export const emailZodSchema = z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email cannot exceed 255 characters')
    .transform(email => email.toLowerCase());

// Password validation
export const passwordZodSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        'Password must contain at least one special character'
    );

// Name validation
export const nameZodSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Phone validation (international format)
export const phoneZodSchema = z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const staffSignUpZodSchema = z.object({
    company_id: ulidZodSchema,
    email: emailZodSchema,
    password: passwordZodSchema,
    first_name: nameZodSchema,
    last_name: nameZodSchema,
    phone: phoneZodSchema,
    role_code: z.enum(['admin', 'staff'])
});

export type StaffSignUpSchema = z.infer<typeof staffSignUpZodSchema>;
