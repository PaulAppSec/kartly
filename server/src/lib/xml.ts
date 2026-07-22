import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { HttpError } from "../middleware/errorHandler.js";

// XXE-safe XML parsing for bulk product import. fast-xml-parser does not resolve
// external entities or DTDs by default, and we explicitly disable entity
// processing — so `<!ENTITY xxe SYSTEM "file:///etc/passwd">` cannot exfiltrate
// files. This is the correct baseline for the XXE lesson (#17); Phase 3 swaps in
// a parser with external entities enabled on `main`.

const parser = new XMLParser({
  ignoreAttributes: false,
  processEntities: false,
  htmlEntities: false,
});

export interface ImportedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
}

// A parser that leaves entities intact so our (deliberately vulnerable) DTD
// resolver can expand them first, mirroring a misconfigured XXE-capable parser.
const rawParser = new XMLParser({ ignoreAttributes: false, processEntities: false });

function toRows(doc: unknown): ImportedProduct[] {
  const root = (doc as Record<string, any>)?.products;
  const rows = root?.product;
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  if (list.length === 0) throw new HttpError(400, "No <product> elements found.");
  return list.map((r: Record<string, unknown>, i: number) => {
    const name = String(r.name ?? "").trim();
    const description = String(r.description ?? "").trim();
    const price = Number(r.price);
    const stock = Number(r.stock);
    if (!name || !description || Number.isNaN(price) || Number.isNaN(stock)) {
      throw new HttpError(400, `Product #${i + 1} is missing required fields.`);
    }
    return {
      name: name.slice(0, 200),
      description: description.slice(0, 2000),
      price: Math.max(0, price),
      stock: Math.max(0, Math.floor(stock)),
      category: r.category ? String(r.category).slice(0, 120) : undefined,
    };
  });
}

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #17 (XXE). DTDs are allowed and
// external `SYSTEM` entities are resolved: a `<!ENTITY xxe SYSTEM "file://…">`
// is read off disk and substituted into the document, so `&xxe;` exfiltrates
// file contents (classic XXE). Sandboxed per §7 — demos read a planted decoy
// (server/decoys/secret.txt), never real host secrets. The fix (fix/xxe) uses
// parseProductXml, which rejects DTDs/entities outright.
export function parseProductXmlUnsafe(xml: string): ImportedProduct[] {
  const entities: Record<string, string> = {};
  // <!ENTITY name SYSTEM "file:///path"> — external entity (the dangerous one).
  const extRe = /<!ENTITY\s+(\w+)\s+SYSTEM\s+"([^"]+)"\s*>/gi;
  for (let m = extRe.exec(xml); m; m = extRe.exec(xml)) {
    const [, name, uri] = m;
    try {
      const path = uri.startsWith("file:") ? fileURLToPath(uri) : uri;
      entities[name] = readFileSync(path, "utf8");
    } catch {
      entities[name] = "";
    }
  }
  // <!ENTITY name "literal"> — internal entity.
  const litRe = /<!ENTITY\s+(\w+)\s+"([^"]*)"\s*>/gi;
  for (let m = litRe.exec(xml); m; m = litRe.exec(xml)) {
    if (!(m[1] in entities)) entities[m[1]] = m[2];
  }
  // Strip the DTD, then substitute &name; references with resolved values.
  let body = xml.replace(/<!DOCTYPE[^>]*(\[[\s\S]*?\])?\s*>/i, "");
  for (const [name, value] of Object.entries(entities)) {
    body = body.split(`&${name};`).join(value);
  }
  let doc: unknown;
  try {
    doc = rawParser.parse(body);
  } catch {
    throw new HttpError(400, "Malformed XML.");
  }
  return toRows(doc);
}

export function parseProductXml(xml: string): ImportedProduct[] {
  // Reject inline DTDs outright — belt and suspenders on top of the safe parser.
  if (/<!DOCTYPE/i.test(xml) || /<!ENTITY/i.test(xml)) {
    throw new HttpError(400, "DTDs and entities are not allowed in product imports.");
  }

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch {
    throw new HttpError(400, "Malformed XML.");
  }

  const root = (doc as Record<string, any>)?.products;
  const rows = root?.product;
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  if (list.length === 0) throw new HttpError(400, "No <product> elements found.");

  return list.map((r: Record<string, unknown>, i: number) => {
    const name = String(r.name ?? "").trim();
    const description = String(r.description ?? "").trim();
    const price = Number(r.price);
    const stock = Number(r.stock);
    if (!name || !description || Number.isNaN(price) || Number.isNaN(stock)) {
      throw new HttpError(400, `Product #${i + 1} is missing required fields.`);
    }
    return {
      name: name.slice(0, 200),
      description: description.slice(0, 2000),
      price: Math.max(0, price),
      stock: Math.max(0, Math.floor(stock)),
      category: r.category ? String(r.category).slice(0, 120) : undefined,
    };
  });
}
