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
