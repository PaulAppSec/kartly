import type { Role } from "@prisma/client";
import { productRepo } from "../data/productRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import { fetchRemoteImage } from "../lib/urlFetch.js";
import { saveImageBuffer, saveUnrestrictedUpload } from "../lib/upload.js";
import { parseProductXmlUnsafe } from "../lib/xml.js";
import type { CreateProductInput, UpdateProductInput } from "../schemas/productSchemas.js";
import { toProductDTO } from "./productService.js";

async function ownedProductOr404(productId: string, sellerId: string, role: Role) {
  const product = await productRepo.findById(productId);
  // Owner or admin may edit; anyone else gets 404 (don't leak existence).
  if (!product || (product.sellerId !== sellerId && role !== "ADMIN")) {
    throw new HttpError(404, "Product not found.");
  }
  return product;
}

export const sellerService = {
  async listMine(sellerId: string) {
    const products = await productRepo.search({});
    return products.filter((p) => p.sellerId === sellerId).map(toProductDTO);
  },

  async create(sellerId: string, input: CreateProductInput) {
    const product = await productRepo.create({ ...input, sellerId });
    return toProductDTO(product);
  },

  async update(sellerId: string, role: Role, productId: string, input: UpdateProductInput) {
    await ownedProductOr404(productId, sellerId, role);
    const product = await productRepo.update(productId, input);
    return toProductDTO(product);
  },

  async setImageFromUpload(
    sellerId: string,
    role: Role,
    productId: string,
    file: Express.Multer.File | undefined,
  ) {
    await ownedProductOr404(productId, sellerId, role);
    // #13 unrestricted upload — no content validation, keeps client extension.
    const url = await saveUnrestrictedUpload(file);
    return toProductDTO(await productRepo.update(productId, { imageUrl: url }));
  },

  // FIX (fix/ssrf) — VULNS.md #12: SSRF-safe fetch (allowlist scheme, block
  // internal ranges, cap size/time, require an image) before saving.
  async setImageFromUrl(sellerId: string, role: Role, productId: string, sourceUrl: string) {
    await ownedProductOr404(productId, sellerId, role);
    const { buffer } = await fetchRemoteImage(sourceUrl);
    const url = await saveImageBuffer(buffer);
    return toProductDTO(await productRepo.update(productId, { imageUrl: url }));
  },

  async importXml(sellerId: string, xml: string) {
    // #17 XXE — DTD/external entities resolved during parse.
    const parsed = parseProductXmlUnsafe(xml);
    const created = await productRepo.createMany(
      parsed.map((p) => ({
        sellerId,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category ?? "General",
      })),
    );
    return created.map(toProductDTO);
  },
};
