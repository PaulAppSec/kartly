import { addressRepo } from "../data/addressRepo.js";
import { orderRepo } from "../data/orderRepo.js";
import { prisma } from "../data/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { CheckoutInput } from "../schemas/orderSchemas.js";

interface OrderRow {
  id: string;
  total: unknown;
  status: string;
  couponCode: string | null;
  createdAt: Date;
  items: {
    id: string;
    qty: number;
    unitPrice: unknown;
    product: { id: string; name: string; imageUrl: string | null } | null;
  }[];
}

function toDTO(o: OrderRow) {
  return {
    id: o.id,
    total: Number(o.total),
    status: o.status,
    couponCode: o.couponCode,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      qty: i.qty,
      unitPrice: Number(i.unitPrice),
      product: i.product,
    })),
  };
}

export const orderService = {
  async listForUser(userId: string) {
    return (await orderRepo.listForUser(userId)).map((o) => toDTO(o as OrderRow));
  },

  // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #5 (IDOR). The ownership check is
  // gone: any authenticated user can read ANY order by guessing/enumerating its
  // id. Fix (fix/idor) restores the `customerId === userId` check (404, not 403).
  async getById(_userId: string, orderId: string) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new HttpError(404, "Order not found.");
    return toDTO(order as OrderRow);
  },

  // FIX (fix/business-logic) — VULNS.md #22. Every line is priced from the DB
  // (client input is never trusted for price), stock is enforced, and qty is a
  // positive integer (schema). The coupon path stays atomic/single-use.
  async checkout(userId: string, input: CheckoutInput) {
    if (input.addressId) {
      const addr = await addressRepo.findById(input.addressId);
      if (!addr || addr.userId !== userId) throw new HttpError(400, "Invalid delivery address.");
    }

    return prisma.$transaction(async (tx) => {
      const ids = [...new Set(input.items.map((i) => i.productId))];
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotalCents = 0;
      const lineItems = input.items.map((item) => {
        const product = byId.get(item.productId);
        if (!product) throw new HttpError(400, `Unknown product: ${item.productId}`);
        if (product.stock < item.qty) {
          throw new HttpError(409, `Not enough stock for “${product.name}”.`);
        }
        const unitCents = Math.round(Number(product.price) * 100);
        subtotalCents += unitCents * item.qty;
        return { productId: product.id, qty: item.qty, unitPrice: Number(product.price) };
      });

      let couponCode: string | null = null;
      let discountCents = 0;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
        if (!coupon) throw new HttpError(400, "That coupon code isn't valid.");
        // Atomic single-use increment: only succeeds while uses < maxUses.
        const claimed = await tx.coupon.updateMany({
          where: { code: input.couponCode, uses: { lt: coupon.maxUses } },
          data: { uses: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new HttpError(400, "That coupon has already been fully used.");
        discountCents = Math.round((subtotalCents * coupon.percentOff) / 100);
        couponCode = coupon.code;
      }

      const totalCents = Math.max(0, subtotalCents - discountCents);

      // Decrement stock atomically within the same transaction.
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }

      const order = await tx.order.create({
        data: {
          customerId: userId,
          total: totalCents / 100,
          status: "PLACED",
          couponCode,
          items: {
            create: lineItems.map((li) => ({
              productId: li.productId,
              qty: li.qty,
              unitPrice: li.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        },
      });

      return toDTO(order as OrderRow);
    });
  },
};
