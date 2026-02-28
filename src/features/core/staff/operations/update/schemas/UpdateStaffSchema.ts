import { z } from "zod";

// Combined update staff body schema
export const updateStaffBodySchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(100, 'First name cannot exceed 100 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100, 'Last name cannot exceed 100 characters').optional(),
    phone: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), 'Invalid phone number format'),
    isActive: z.boolean().optional(),
    skills: z.array(z.string().min(1, 'Skill cannot be empty').max(50, 'Skill name too long'))
        .min(1, 'At least one skill required')
        .max(20, 'Cannot have more than 20 skills').optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field must be provided for update');

export type UpdateStaffSchema = z.infer<typeof updateStaffBodySchema>;
