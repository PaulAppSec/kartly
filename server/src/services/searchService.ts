import { prisma } from "../data/prisma.js";

// FIX (fix/sqli) — VULNS.md #1. The search term is now bound as a PARAMETER via
// a tagged `$queryRaw` template, so it is always treated as a literal string;
// a `' UNION SELECT …` payload matches no product and exfiltrates nothing.
export const searchService = {
  async rawSearch(q: string): Promise<unknown[]> {
    const like = `%${q}%`;
    return prisma.$queryRaw`
      SELECT id, name, description, category
      FROM "Product"
      WHERE name ILIKE ${like} OR description ILIKE ${like}
      ORDER BY name ASC`;
  },
};
