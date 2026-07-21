import { prisma } from "./prisma.js";

const orderInclude = {
  items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
};

export const orderRepo = {
  listForUser(userId: string) {
    return prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
  },
  findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude });
  },
};
