import type { Role } from "@prisma/client";
import { productRepo } from "../data/productRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import { fetchUrlUnsafe } from "../lib/urlFetch.js";
import { saveRawBuffer, saveUnrestrictedUpload } from "../lib/upload.js";
import { parseProductXml } from "../lib/xml.js";
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

  async setImageFromUrl(sellerId: string, role: Role, productId: string, sourceUrl: string) {
    await ownedProductOr404(productId, sellerId, role);
    // #12 SSRF — raw fetch of an attacker URL; the fetched bytes are persisted
    // and served back via /uploads, exposing internal responses.
    const { buffer } = await fetchUrlUnsafe(sourceUrl);
    const url = await saveRawBuffer(buffer);
    return toProductDTO(await productRepo.update(productId, { imageUrl: url }));
  },

  async importXml(sellerId: string, xml: string) {
    // FIX (fix/xxe) — VULNS.md #17: parse with DTD/entity processing disabled;
    // any <!DOCTYPE>/<!ENTITY> is rejected outright, so no file read occurs.
    const parsed = parseProductXml(xml);
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
