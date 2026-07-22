import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { HttpError } from "../middleware/errorHandler.js";

// SSRF-safe fetch for the "import image from URL" feature. It:
//  - allows only http/https,
//  - resolves the hostname and rejects private / loopback / link-local ranges
//    (blocks cloud metadata at 169.254.169.254 and localhost:5432, etc.),
//  - caps the response size and time.
// This is the correct baseline for the SSRF lesson (#12); Phase 3 fetches the
// raw user URL with no checks on `main`.

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 5000;

function isBlockedIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isBlockedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) return isBlockedIPv4(lower.split(":").pop() ?? ""); // mapped v4
  return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
  const literal = isIP(hostname);
  const ips = literal ? [{ address: hostname, family: literal }] : await lookup(hostname, { all: true });
  for (const { address, family } of ips) {
    const blocked = family === 6 ? isBlockedIPv6(address) : isBlockedIPv4(address);
    if (blocked) throw new HttpError(400, "That URL points to a disallowed (internal) address.");
  }
}

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #12 (SSRF). Fetches the raw user
// URL with NO host validation, so internal/loopback/link-local targets
// (127.0.0.1, 169.254.169.254 cloud metadata, DB ports…) are reachable and
// their responses are returned to the caller. Sandboxed to the container per §7
// — no real cloud metadata or outbound egress is wired. The fix (fix/ssrf)
// switches callers back to fetchRemoteImage (the allowlisted version above).
export async function fetchUrlUnsafe(
  rawUrl: string,
): Promise<{ buffer: Buffer; contentType: string; status: number }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new HttpError(400, "Invalid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "Only http and https URLs are allowed.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // No assertPublicHost(), no content-type gate — the whole point of the vuln.
    const res = await fetch(url, { signal: controller.signal });
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      buffer,
      contentType: res.headers.get("content-type") ?? "application/octet-stream",
      status: res.status,
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, "Could not fetch that URL.");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRemoteImage(rawUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new HttpError(400, "Invalid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "Only http and https URLs are allowed.");
  }
  await assertPublicHost(url.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "error" });
    if (!res.ok) throw new HttpError(400, `Fetch failed (${res.status}).`);
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new HttpError(415, "That URL is not an image.");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) throw new HttpError(413, "Image is too large.");
    return { buffer: buf, contentType };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, "Could not fetch that URL.");
  } finally {
    clearTimeout(timer);
  }
}
