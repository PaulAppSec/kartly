import { prisma } from "../data/prisma.js";

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #1 (SQLi, UNION/data).
// The search term is concatenated straight into raw SQL via $queryRawUnsafe,
// so a crafted `q` can UNION in rows from any table (e.g. User credentials).
// Fix lives on fix/sqli (parameterized $queryRaw / Prisma).
export const searchService = {
  async rawSearch(q: string): Promise<unknown[]> {
    const sql = `SELECT id, name, description, category
                 FROM "Product"
                 WHERE name ILIKE '%${q}%' OR description ILIKE '%${q}%'
                 ORDER BY name ASC`;
    return prisma.$queryRawUnsafe(sql);
  },
};
