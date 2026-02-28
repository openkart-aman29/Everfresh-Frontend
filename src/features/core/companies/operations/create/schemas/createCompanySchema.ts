import { z } from "zod";
import { nameZodSchema, emailZodSchema, phoneZodSchema } from "@/features/core/staff/operations/create/schemas/CreateStaffSchema";

export const createCompanyBodySchema = z.object({
    company_name: nameZodSchema,
    slug: z.string().optional().or(z.literal('')), // Can be auto-generated later
    email: emailZodSchema,
    phone: phoneZodSchema,
    address: z.string().min(1, "Address cannot be empty"),
    logo_url: z.union([z.string().url("Invalid URL"), z.literal('')]).optional().nullable(),
    subscription_tier: z.enum(['free', 'basic', 'premium', 'enterprise']),
});

export type CreateCompanySchema = z.infer<typeof createCompanyBodySchema>;
