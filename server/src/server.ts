import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { prisma } from "./data/prisma.js";

const app = createApp();

const server = app.listen(env.port, env.host, () => {
  // Reachability is constrained by the docker-compose publish
  // "127.0.0.1:4000:4000" — Kartly is localhost-only, never on the network.
  console.log(`kartly: listening on http://localhost:${env.port}  (docs: /api/docs)`);
});

async function shutdown(signal: string) {
  console.log(`kartly: ${signal} received, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
