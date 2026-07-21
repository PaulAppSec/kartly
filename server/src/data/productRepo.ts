import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

// Allowlisted sort options → concrete Prisma orderBy. This mapping is the
// defense against ORDER BY injection / blind SQLi (#3): user input never
// reaches the query as a column name.
const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name: { name: "asc" },
};

export interface ProductQuery {
  q?: string;
  category?: string;
  sort?: string;
}

export const productRepo = {
  search({ q, category, sort }: ProductQuery) {
    const where: Prisma.ProductWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category && category !== "All") where.category = category;
    const orderBy = SORTS[sort ?? "newest"] ?? SORTS.newest;
    return prisma.product.findMany({ where, orderBy });
  },
  findAll() {
    return prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  },
  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },
  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  },
  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },
  createMany(data: Prisma.ProductUncheckedCreateInput[]) {
    return prisma.$transaction(data.map((d) => prisma.product.create({ data: d })));
  },
};
