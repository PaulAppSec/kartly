import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { csrfGuard } from "../middleware/csrf.js";
import { uploadImage } from "../lib/upload.js";
import { validate } from "../middleware/validate.js";
import { importUrlSchema } from "../schemas/productSchemas.js";
import { addressSchema, updateMeSchema } from "../schemas/userSchemas.js";

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/", userController.me);
// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #11 (CSRF). The profile/email
// update is state-changing and cookie-authenticated but no longer carries a
// csrfGuard, so an attacker page can auto-submit it cross-site. Fix (fix/csrf)
// restores csrfGuard here.
meRouter.patch("/", validate(updateMeSchema), userController.updateMe);

meRouter.post("/avatar", csrfGuard, uploadImage.single("image"), userController.uploadAvatar);
meRouter.post("/avatar-url", csrfGuard, validate(importUrlSchema), userController.avatarFromUrl);

meRouter.get("/addresses", userController.listAddresses);
meRouter.post("/addresses", csrfGuard, validate(addressSchema), userController.addAddress);
meRouter.delete("/addresses/:id", csrfGuard, userController.deleteAddress);
