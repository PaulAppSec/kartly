import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.coerce.number().min(0).max(1_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  category: z.string().min(1).max(120).default("General"),
});

export const updateProductSchema = createProductSchema.partial();

export const importUrlSchema = z.object({
  url: z.string().url().max(2000),
});

export const importXmlSchema = z.object({
  xml: z.string().min(1).max(200_000),
});

export const announcementSchema = z.object({
  template: z.string().min(1).max(2000),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
