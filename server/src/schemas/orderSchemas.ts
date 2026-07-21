import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        // qty is a positive integer — negative/zero quantities are rejected
        // here (secure baseline for the negative-qty logic flaw, #22).
        qty: z.coerce.number().int().min(1).max(100),
      }),
    )
    .min(1, "Your cart is empty."),
  couponCode: z.string().min(1).max(40).optional(),
  addressId: z.string().min(1).max(80).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
