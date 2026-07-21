import { z } from "zod";

// PATCH /api/me — allowlisted fields only. No `role`, no `email`, no
// `passwordHash`: the Zod pick is the mass-assignment defense (#7).
export const updateMeSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().max(500).optional(),
  })
  .strict();

export const addressSchema = z.object({
  line1: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
