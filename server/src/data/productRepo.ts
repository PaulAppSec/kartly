import type { Prisma, Product } from "@prisma/client";
import { prisma } from "./prisma.js";

export interface ProductQuery {
  q?: string;
  category?: string;
  sort?: string;
}

export const productRepo = {
  // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #3 (blind SQLi).
  // q and category are parameterized ($1/$2), but the `sort` value is
  // concatenated straight into the ORDER BY clause, so a boolean/time-based
  // payload leaks data one bit at a time. Fix (fix/blind-sqli) allowlists
  // the sort column.
  search({ q, category, sort }: ProductQuery) {
    // FIX (fix/blind-sqli) — VULNS.md #3. The sort key is mapped through a fixed
    // allowlist to a known-safe ORDER BY clause; arbitrary input (e.g.
    // `(SELECT 1 FROM pg_sleep(3))`) falls back to the default and never reaches
    // the query, so there is no injectable boolean/time oracle.
    const SORTS: Record<string, string> = {
      name: '"name" ASC',
      "price-asc": '"price" ASC',
      "price-desc": '"price" DESC',
      newest: '"createdAt" DESC',
      oldest: '"createdAt" ASC',
    };
    const orderBy = SORTS[sort ?? ""] ?? '"createdAt" DESC';
    const sql = `SELECT * FROM "Product"
                 WHERE (name ILIKE $1 OR description ILIKE $1)
                   AND ($2::text IS NULL OR category = $2)
                 ORDER BY ${orderBy}`;
    return prisma.$queryRawUnsafe<Product[]>(sql, `%${q ?? ""}%`, category && category !== "All" ? category : null);
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
