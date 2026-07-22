import { z } from "zod";

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #22 (Business logic). `qty` is no
// longer constrained to be positive, and the client may send `unitPrice`, which
// the checkout trusts. The fix (fix/business-logic) restores `min(1)` and drops
// client-supplied pricing (server prices from the DB).
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        qty: z.coerce.number().int().min(-1000).max(1000),
        unitPrice: z.coerce.number().optional(),
      }),
    )
    .min(1, "Your cart is empty."),
  couponCode: z.string().min(1).max(40).optional(),
  addressId: z.string().min(1).max(80).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
