import { PrismaClient } from "@prisma/client";

// Single shared Prisma client for the process. All DB access lives under
// `data/` (layering rule, spec §3): routes → controllers → services → data.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query", "warn", "error"],
});
