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
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiNotFound } from "./middleware/notFound.js";
import { adminApiRouter } from "./routes/adminApi.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { messagesRouter } from "./routes/messages.js";
import { ordersRouter } from "./routes/orders.js";
import { pagesRouter } from "./routes/pages.js";
import { productsRouter } from "./routes/products.js";
import { searchRouter } from "./routes/search.js";
import { sellerRouter } from "./routes/seller.js";

export function createApp() {
  const app = express();

  // Trust the loopback proxy (docker) so rate-limit / IP handling is correct.
  app.set("trust proxy", "loopback");

  // ── Server-rendered views (EJS): admin, receipts, invoices, share, store.
  const viewsDir = [
    resolve(process.cwd(), "server/src/views"),
    resolve(process.cwd(), "src/views"),
  ].find(existsSync);
  if (viewsDir) {
    app.set("view engine", "ejs");
    app.set("views", viewsDir);
  }

  // ── Security baseline (Phase 1/2). CORRECT defaults; specific
  //    misconfigurations (CORS #23, verbose errors #20, etc.) land in Phase 3.
  app.disable("x-powered-by");
  app.use(
    helmet({
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

  // ── Uploaded files (validated on write; served read-only).
  app.use("/uploads", express.static(env.uploadDir, { index: false, dotfiles: "deny" }));

  // ── API (rate-limited)
  app.use("/api", apiLimiter);
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/seller", sellerRouter);
  app.use("/api/admin", adminApiRouter);

  // ── Live API docs
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(loadOpenApi() as object));

  // Unmatched API routes → JSON 404 (before the SPA fallback).
  app.use("/api", apiNotFound);

  // ── Server-rendered surfaces
  app.use("/admin", adminRouter);
  app.use("/", pagesRouter);

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
