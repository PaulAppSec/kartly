import { prisma } from "./prisma.js";

// Read-side queries for the server-rendered admin back office.
export const adminRepo = {
  async counts() {
    const [users, products, orders, coupons] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.coupon.count(),
    ]);
    return { users, products, orders, coupons };
  },
  users() {
    return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  },
  orders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { email: true, name: true } }, items: true },
    });
  },
  products() {
    return prisma.product.findMany({
      orderBy: { createdAt: "asc" },
      include: { seller: { select: { email: true, name: true } } },
    });
  },
  coupons() {
    return prisma.coupon.findMany({ orderBy: { code: "asc" } });
  },
};
