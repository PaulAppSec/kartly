import { z } from "zod";

// FIX (fix/business-logic) — VULNS.md #22. `qty` must be a positive integer
// again, and there is no client `unitPrice` field (unknown keys are stripped),
// so the client can neither price the order nor go negative.
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        qty: z.coerce.number().int().min(1).max(100),
      }),
    )
    .min(1, "Your cart is empty."),
  couponCode: z.string().min(1).max(40).optional(),
  addressId: z.string().min(1).max(80).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
