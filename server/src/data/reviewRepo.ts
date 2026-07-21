import { prisma } from "./prisma.js";

export const reviewRepo = {
  listByProduct(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
  },
  create(data: { productId: string; authorId: string; body: string; rating: number }) {
    return prisma.review.create({
      data,
      include: { author: { select: { id: true, name: true } } },
    });
  },
};
