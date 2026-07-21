import { defineConfig } from "vitest/config";

// Exploit / fixed tests run black-box against the RUNNING app (docker compose
// up), proving the live server is exploitable on `main` and hardened on fix/*.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
