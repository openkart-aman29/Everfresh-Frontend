import { z } from 'zod'
import { emailZodSchema, passwordZodSchema } from '@/features/auth/staff/utils/AuthValidation'

export const signInSchema = z.object({
    email: emailZodSchema,
    password: passwordZodSchema,
})

export type SignInSchema = z.infer<typeof signInSchema>
