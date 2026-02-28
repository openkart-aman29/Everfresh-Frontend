import { z } from "zod";
import { nameZodSchema, emailZodSchema, phoneZodSchema } from "@/features/core/admin/operations/create/schemas/CreateAdminSchema";

export const updateAdminBodySchema = z.object({
    first_name: nameZodSchema,
    last_name: nameZodSchema,
    email: emailZodSchema,
    phone: phoneZodSchema,
    is_active: z.boolean().optional()
});

export type UpdateAdminSchema = z.infer<typeof updateAdminBodySchema>;
