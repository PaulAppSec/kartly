import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import multer from "multer";
import { env } from "./env.js";
import { HttpError } from "../middleware/errorHandler.js";

// Secure-baseline image upload. Buffer the file in memory, verify it by MAGIC
// BYTES (not the client-supplied MIME/extension), then write it under a random
// name into a non-executable uploads dir. This is the correct handling for the
// unrestricted-upload lesson (#13); Phase 3 removes the checks on `main`.

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
});

const SIGNATURES: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: "png", test: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  { ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  {
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

export async function saveImageBuffer(buffer: Buffer): Promise<string> {
  const match = SIGNATURES.find((s) => s.test(buffer));
  if (!match) throw new HttpError(415, "Unsupported image type. Use PNG, JPG, GIF, or WebP.");
  const name = `${randomBytes(16).toString("hex")}.${match.ext}`;
  await writeFile(join(env.uploadDir, name), buffer);
  return `/uploads/${name}`;
}

export async function saveValidatedImage(file: Express.Multer.File | undefined): Promise<string> {
  if (!file) throw new HttpError(400, "No image file provided.");
  return saveImageBuffer(file.buffer);
}

function sanitizeExt(raw: string): string {
  return raw.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "bin";
}

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #13 (Unrestricted upload). No magic-
// byte / MIME / content validation; the CLIENT-supplied extension is preserved
// and the file is written into the web-readable uploads dir. An attacker can
// upload .html/SVG-with-script and have it served as active content. The fix
// (fix/upload) routes callers back to saveValidatedImage.
export async function saveUnrestrictedUpload(file: Express.Multer.File | undefined): Promise<string> {
  if (!file) throw new HttpError(400, "No file provided.");
  const dot = file.originalname.lastIndexOf(".");
  const ext = dot >= 0 ? sanitizeExt(file.originalname.slice(dot + 1)) : "bin";
  const name = `${randomBytes(8).toString("hex")}.${ext}`;
  await writeFile(join(env.uploadDir, name), file.buffer);
  return `/uploads/${name}`;
}

// ⚠️ VULNERABLE ON PURPOSE (main) — used by the SSRF import path (#12) to persist
// whatever bytes were fetched from a user URL, with no image validation, so the
// exfiltrated internal response is readable back via /uploads.
export async function saveRawBuffer(buffer: Buffer, ext = "txt"): Promise<string> {
  const name = `${randomBytes(8).toString("hex")}.${sanitizeExt(ext)}`;
  await writeFile(join(env.uploadDir, name), buffer);
  return `/uploads/${name}`;
}
