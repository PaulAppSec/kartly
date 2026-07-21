# Kartly

> # ⚠️ DO NOT DEPLOY THIS. LOCAL USE ONLY.
>
> **Kartly is *intentionally* vulnerable software.** The `main` branch contains
> real, exploitable security flaws on purpose. It is a teaching artifact for the
> "build it → break it → fix it" AppSec series. Run it **only** on `localhost` or
> an isolated VM. Never expose it to a network, never host it publicly, never put
> real data in it. Every published port in `docker-compose.yml` is bound to
> `127.0.0.1` for this reason.

Kartly is a modern local marketplace — a realistic e-commerce app (catalog,
cart/checkout, accounts, reviews, messaging, uploads, coupons, seller dashboard,
admin back office) built on a production-grade TypeScript stack. It exists in two
states:

- **`main`** — the deliberately **vulnerable** build (all 24 vuln classes live).
- **`fix/<slug>`** — one branch per vulnerability class, each secured correctly
  and opened as a PR against `main`. **The PR diff is the lesson.** These branches
  are never merged into `main` — merging one would remove the very bug it teaches.

The full vulnerability index lives in [`VULNS.md`](./VULNS.md).

---

## Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript (strict), client + server |
| Client | React + Vite (SPA) + self-hosted fonts |
| Server | Node.js + Express |
| DB | PostgreSQL + Prisma |
| Docs | OpenAPI/Swagger at `/api/docs` |
| Run | docker-compose (Postgres + app) |

## Run it (one command)

Requires Docker Desktop.

```bash
cp .env.example .env      # optional — compose has safe local defaults
docker compose up --build
```

Then open:

- Storefront → <http://localhost:4000>
- API health → <http://localhost:4000/api/health>
- API docs → <http://localhost:4000/api/docs>

The container migrates the schema and seeds the database on first boot. Postgres
data and uploads persist in named Docker volumes; `docker compose down -v` wipes
them for a clean slate.

### Seeded accounts (local demo only)

| Email | Role | Password |
|-------|------|----------|
| `admin@kartly.test` | ADMIN | `admin1234` |
| `seller@kartly.test` | SELLER | `seller1234` |
| `alice@kartly.test` | CUSTOMER | `alice1234` |
| `bob@kartly.test` | CUSTOMER | `bob1234` |
| `carol@kartly.test` | CUSTOMER | `carol1234` |

> These are throwaway credentials for a throwaway local app. Auth flows are wired
> up in Phase 2.

## Local development (without Docker for the app)

```bash
npm install
docker compose up -d db          # Postgres only
npm run seed --workspace server  # after `prisma db push`
npm run dev                      # client (5173) + server (4000)
```

## Project layout

```
kartly/
  docker-compose.yml   server/   client/   openapi.yaml   VULNS.md
```

See the build spec (`../KARTLY_BUILD_SPEC.md`) for the full design.

## Safety rails

Dangerous vuln classes (RCE, SSRF, file upload, XXE) are reachable for demos but
sandboxed to the container and operate only against **planted decoy files**
(`server/decoys/`) — never real host secrets or live cloud metadata. Details in
`VULNS.md`.
