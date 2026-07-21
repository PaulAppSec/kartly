import type { Product } from "@prisma/client";
import { productRepo } from "../data/productRepo.js";
import { HttpError } from "../middleware/errorHandler.js";

// Public shape returned to the client. Explicit DTO mapping keeps internal
// fields from leaking by default (the "over-broad serializer" mistake, vuln
// #21, is introduced deliberately in Phase 3).
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

function toDTO(p: Product): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    category: p.category,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
  };
}

export const productService = {
  async list(): Promise<ProductDTO[]> {
    const products = await productRepo.findAll();
    return products.map(toDTO);
  },
  async getById(id: string): Promise<ProductDTO> {
    const product = await productRepo.findById(id);
    if (!product) throw new HttpError(404, "Product not found.");
    return toDTO(product);
  },
};
