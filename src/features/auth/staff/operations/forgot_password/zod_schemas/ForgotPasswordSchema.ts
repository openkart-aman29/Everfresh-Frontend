import { z } from 'zod'
import { emailZodSchema } from '@/features/auth/staff/utils/AuthValidation'

export const forgotPasswordSchema = z.object({
    email: emailZodSchema,
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
