import type { Product } from "@prisma/client";
import { productRepo, type ProductQuery } from "../data/productRepo.js";
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
  sellerId: string | null;
  createdAt: string;
}

export function toProductDTO(p: Product): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    category: p.category,
    imageUrl: p.imageUrl,
    sellerId: p.sellerId,
    createdAt: p.createdAt.toISOString(),
  };
}

export const productService = {
  async search(query: ProductQuery): Promise<ProductDTO[]> {
    const products = await productRepo.search(query);
    return products.map(toProductDTO);
  },
  async list(): Promise<ProductDTO[]> {
    return (await productRepo.findAll()).map(toProductDTO);
  },
  async getById(id: string): Promise<ProductDTO> {
    const product = await productRepo.findById(id);
    if (!product) throw new HttpError(404, "Product not found.");
    return toProductDTO(product);
  },
};
