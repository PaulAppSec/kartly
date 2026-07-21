import { prisma } from "./prisma.js";

export const addressRepo = {
  listForUser(userId: string) {
    return prisma.address.findMany({ where: { userId }, orderBy: { city: "asc" } });
  },
  create(userId: string, data: { line1: string; city: string; country: string }) {
    return prisma.address.create({ data: { ...data, userId } });
  },
  findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  },
  delete(id: string) {
    return prisma.address.delete({ where: { id } });
  },
};
