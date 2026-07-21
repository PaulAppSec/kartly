import { z } from "zod";

export const reviewSchema = z.object({
  body: z.string().min(1).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
