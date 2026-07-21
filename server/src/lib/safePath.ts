import { resolve, sep } from "node:path";
import { HttpError } from "../middleware/errorHandler.js";

// Confine a user-supplied filename to a base directory. Resolve the joined
// path and verify it still sits inside the base — defeating `../` traversal.
// Correct baseline for the path-traversal/LFI lesson (#14); Phase 3 joins the
// raw input on `main`.
export function resolveWithinBase(baseDir: string, userPath: string): string {
  const base = resolve(baseDir);
  const target = resolve(base, userPath);
  if (target !== base && !target.startsWith(base + sep)) {
    throw new HttpError(400, "Invalid file path.");
  }
  return target;
}
