import { productRepo } from "../data/productRepo.js";
import { reviewRepo } from "../data/reviewRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { ReviewInput } from "../schemas/reviewSchemas.js";

interface ReviewWithAuthor {
  id: string;
  body: string;
  rating: number;
  createdAt: Date;
  author: { id: string; name: string };
}

// Note: `body` is returned as plain text. React escapes it on render, so the
// secure baseline is XSS-safe. The stored-XSS lesson (#8) is introduced in
// Phase 3 by rendering it as raw HTML.
function toDTO(r: ReviewWithAuthor) {
  return {
    id: r.id,
    body: r.body,
    rating: r.rating,
    createdAt: r.createdAt.toISOString(),
    author: r.author,
  };
}

export const reviewService = {
  async listForProduct(productId: string) {
    return (await reviewRepo.listByProduct(productId)).map(toDTO);
  },
  async create(productId: string, authorId: string, input: ReviewInput) {
    const product = await productRepo.findById(productId);
    if (!product) throw new HttpError(404, "Product not found.");
    const review = await reviewRepo.create({ productId, authorId, ...input });
    return toDTO(review);
  },
};
