// Central, typed access to environment configuration.
// Kept intentionally small in Phase 1; grows with auth/uploads in Phase 2.

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4000),
  // Container listens on all interfaces so Docker can forward the published
  // port; the localhost-only guarantee is enforced by the compose mapping
  // "127.0.0.1:4000:4000". Kartly is never reachable from the network.
  host: process.env.HOST ?? "0.0.0.0",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:4000",
  databaseUrl: required("DATABASE_URL", "postgresql://kartly:kartly_dev_password@db:5432/kartly?schema=public"),
  uploadDir: process.env.UPLOAD_DIR ?? "/app/uploads",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
} as const;
