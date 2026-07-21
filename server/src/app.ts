import { existsSync } from "node:fs";
import { resolve } from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./lib/env.js";
import { loadOpenApi } from "./lib/openapi.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiNotFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";
import { productsRouter } from "./routes/products.js";

export function createApp() {
  const app = express();

  // ── Security baseline (Phase 1). These are the CORRECT defaults; specific
  //    misconfigurations (CORS #23, verbose errors #20, etc.) are introduced
  //    deliberately in Phase 3 on `main`.
  app.disable("x-powered-by");
  app.use(
    helmet({
      // Functional secure baseline. Self-hosted fonts/scripts; product images
      // may come from https CDNs. The stored-XSS fix (#8) tightens this further
      // (nonces, no 'unsafe-inline'); the misconfig vuln (#20) loosens it.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: [env.clientOrigin],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan("dev"));

  // ── API
  app.use("/api/health", healthRouter);
  app.use("/api/products", productsRouter);

  // ── Live API docs
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(loadOpenApi() as object));

  // Unmatched API routes → JSON 404 (before the SPA fallback).
  app.use("/api", apiNotFound);

  // ── Static SPA (built client) + history fallback.
  const clientDist = [
    resolve(process.cwd(), "client/dist"),
    resolve(process.cwd(), "../client/dist"),
  ].find(existsSync);

  if (clientDist) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(resolve(clientDist, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.type("text/plain").send("Kartly API is running. Build the client to serve the SPA.");
    });
  }

  // ── Error handler (last).
  app.use(errorHandler);

  return app;
}
