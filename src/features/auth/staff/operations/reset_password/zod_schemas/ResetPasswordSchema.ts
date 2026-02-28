import { z } from 'zod'
import { passwordZodSchema } from '@/features/auth/staff/utils/AuthValidation'

export const resetPasswordSchema = z.object({
    newPassword: passwordZodSchema,
    confirmPassword: passwordZodSchema,
    resetToken: z.string().min(1, 'Token is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
