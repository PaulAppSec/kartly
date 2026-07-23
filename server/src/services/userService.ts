import { addressRepo } from "../data/addressRepo.js";
import { userRepo } from "../data/userRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import { fetchRemoteImage } from "../lib/urlFetch.js";
import { saveImageBuffer, saveUnrestrictedUpload } from "../lib/upload.js";
import type { AddressInput, UpdateMeInput } from "../schemas/userSchemas.js";
import { toPublicUser } from "./authService.js";

export const userService = {
  // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #21 (Sensitive data exposure).
  // Returns the RAW user row (including `passwordHash`, which is #4's plaintext)
  // instead of the public DTO. The fix (fix/data-exposure) returns
  // toPublicUser(user) — an explicit field allowlist.
  async getMe(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw new HttpError(404, "User not found.");
    return user;
  },

  async updateMe(userId: string, input: UpdateMeInput) {
    // input is already allowlisted by Zod (name/bio/avatarUrl only).
    const user = await userRepo.update(userId, input);
    return toPublicUser(user);
  },

  async setAvatarFromUpload(userId: string, file: Express.Multer.File | undefined) {
    // #13 unrestricted upload.
    const url = await saveUnrestrictedUpload(file);
    return toPublicUser(await userRepo.update(userId, { avatarUrl: url }));
  },

  // FIX (fix/ssrf) — VULNS.md #12. fetchRemoteImage allows only http/https,
  // resolves the host and blocks private/loopback/link-local ranges, caps
  // size/time, and requires an image content-type — so internal targets are
  // refused (400) before any request is made.
  async setAvatarFromUrl(userId: string, sourceUrl: string) {
    const { buffer } = await fetchRemoteImage(sourceUrl);
    const url = await saveImageBuffer(buffer);
    return toPublicUser(await userRepo.update(userId, { avatarUrl: url }));
  },

  listAddresses(userId: string) {
    return addressRepo.listForUser(userId);
  },

  addAddress(userId: string, input: AddressInput) {
    return addressRepo.create(userId, input);
  },

  async deleteAddress(userId: string, addressId: string) {
    const addr = await addressRepo.findById(addressId);
    // Object-level ownership check — 404 (not 403) so we don't leak existence.
    if (!addr || addr.userId !== userId) throw new HttpError(404, "Address not found.");
    await addressRepo.delete(addressId);
  },
};
