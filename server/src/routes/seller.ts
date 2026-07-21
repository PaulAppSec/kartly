import { Router } from "express";
import { sellerController } from "../controllers/sellerController.js";
import { requireAuth } from "../middleware/auth.js";
import { csrfGuard } from "../middleware/csrf.js";
import { requireRole } from "../middleware/roleGuard.js";
import { uploadImage } from "../lib/upload.js";
import { validate } from "../middleware/validate.js";
import {
  announcementSchema,
  createProductSchema,
  importUrlSchema,
  importXmlSchema,
  updateProductSchema,
} from "../schemas/productSchemas.js";

export const sellerRouter = Router();

// Seller area: authenticated SELLER or ADMIN only (role guard = the correct
// baseline for the privilege-escalation lesson #6).
sellerRouter.use(requireAuth, requireRole("SELLER", "ADMIN"));

sellerRouter.get("/products", sellerController.listMine);
sellerRouter.post("/products", csrfGuard, validate(createProductSchema), sellerController.create);
sellerRouter.patch(
  "/products/:id",
  csrfGuard,
  validate(updateProductSchema),
  sellerController.update,
);
sellerRouter.post(
  "/products/:id/image",
  csrfGuard,
  uploadImage.single("image"),
  sellerController.uploadImage,
);
sellerRouter.post(
  "/products/:id/import-url",
  csrfGuard,
  validate(importUrlSchema),
  sellerController.importImageFromUrl,
);
sellerRouter.post(
  "/products/import-xml",
  csrfGuard,
  validate(importXmlSchema),
  sellerController.importXml,
);

sellerRouter.get("/announcement", sellerController.getAnnouncement);
sellerRouter.post(
  "/announcement",
  csrfGuard,
  validate(announcementSchema),
  sellerController.setAnnouncement,
);
