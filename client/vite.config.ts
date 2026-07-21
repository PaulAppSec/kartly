import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The built SPA is served by the Express app in production. In local dev the
// Vite server proxies /api to the backend. Localhost only — never exposed.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
