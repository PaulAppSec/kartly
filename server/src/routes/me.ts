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
// FIX (fix/csrf) — VULNS.md #11. Restore the double-submit CSRF guard on this
// cookie-authenticated, state-changing route, so a cross-site request without a
// valid X-CSRF-Token is rejected (403).
meRouter.patch("/", csrfGuard, validate(updateMeSchema), userController.updateMe);

meRouter.post("/avatar", csrfGuard, uploadImage.single("image"), userController.uploadAvatar);
meRouter.post("/avatar-url", csrfGuard, validate(importUrlSchema), userController.avatarFromUrl);

meRouter.get("/addresses", userController.listAddresses);
meRouter.post("/addresses", csrfGuard, validate(addressSchema), userController.addAddress);
meRouter.delete("/addresses/:id", csrfGuard, userController.deleteAddress);
