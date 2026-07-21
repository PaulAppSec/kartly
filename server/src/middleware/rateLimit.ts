import rateLimit from "express-rate-limit";

// Secure-baseline rate limiters. The "no rate limiting" lesson (vuln #24) is
// introduced in Phase 3 by removing these from the sensitive routes.

const message = { error: { message: "Too many attempts. Please slow down and try again shortly." } };

// Tight limiter for credential endpoints (login, register, reset).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

// Moderate limiter for coupon apply (blunts coupon brute force / race abuse).
export const couponLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

// Generic API limiter, generous enough for normal browsing.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});
