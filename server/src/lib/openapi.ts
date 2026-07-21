import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";

// Load the OpenAPI document from the repo/image root. Falls back to a minimal
// stub so /api/docs never hard-crashes if the file is missing.
const CANDIDATES = [
  process.env.OPENAPI_PATH,
  resolve(process.cwd(), "openapi.yaml"),
  resolve(process.cwd(), "../openapi.yaml"),
].filter(Boolean) as string[];

const STUB = {
  openapi: "3.0.3",
  info: { title: "Kartly API", version: "2.0.0-vulnerable" },
  paths: {},
};

export function loadOpenApi(): unknown {
  for (const path of CANDIDATES) {
    try {
      return YAML.parse(readFileSync(path, "utf8"));
    } catch {
      // try next candidate
    }
  }
  return STUB;
}
