import { prisma } from "./prisma.js";

// Data layer: the only place Prisma is touched for products (spec §3).
export const productRepo = {
  findAll() {
    return prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  },
  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },
};
