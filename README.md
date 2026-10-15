# Pacsaz

A packaging **dieline** platform: a public site where users browse, customise and
download dielines, and a separate admin panel where staff manage the catalogue,
pricing and customers.

Built as a Turborepo monorepo with two Next.js apps that share their data layer,
UI kit and geometry engine.

| App | Purpose | Local |
| --- | --- | --- |
| `client` | Public site: catalogue, dieline editor, subscriptions, payments, user panel | http://localhost:3000 |
| `admin` | Staff panel: dielines, tarrifs, categories, coupons, customers, payments | http://localhost:3001 |

---

## Stack

- **Next.js 16** (App Router) with React 19, TypeScript 5.9
- **PostgreSQL** via **Prisma 7** (`@prisma/adapter-pg`)
- **Redux Toolkit** for the editor's document state, with **redux-undo**
- **Auth.js v5** (NextAuth) — credentials, JWT sessions
- **Tailwind CSS 4** + **shadcn/ui**-style primitives (Radix / Base UI)
- **maker.js** for the 2D dieline geometry engine
- **Turborepo** + **pnpm workspaces**
- Integrations: **Kavenegar** (SMS OTP), **Zarinpal** (payments), **Cloudinary** (images)

## Requirements

- Node.js >= 18 (developed on 22)
- pnpm 9 (`packageManager` is pinned in the root `package.json`)
- A PostgreSQL database

## Getting started

```bash
pnpm install
```

Create the `.env` files (the apps read their own; see [Environment](#environment)),
then prepare the database:

```bash
pnpm --filter @repo/db run prisma:generate   # generates the client
pnpm --filter @repo/db run prisma:migrate    # applies migrations
pnpm --filter @repo/db run prisma:generate-admin   # optional: first admin account
pnpm --filter @repo/db run seed:tarrifs      # optional: seed tarrif plans
```

Run both apps:

```bash
pnpm dev
```

## Scripts

Root (all run through Turborepo):

| Script | Description |
| --- | --- |
| `pnpm dev` | Run every workspace's `dev` task |
| `pnpm build` | Build every workspace |
| `pnpm lint` | Lint every workspace |
| `pnpm check-types` | Type-check every workspace |
| `pnpm check:case` | Fail if any import or tracked path differs from the real path by **case only** |
| `pnpm format` | Prettier over `**/*.{ts,tsx,md}` |

`check:case` exists because Windows and macOS resolve `./model` to `Model.ts`
while a Linux build does not. Run it before pushing; it is the cheapest way to
catch a "Module not found" that only appears in CI or production.

Database (`@repo/db`):

| Script | Description |
| --- | --- |
| `prisma:generate` | Generate the Prisma client into `src/generated/prisma` |
| `prisma:migrate` | Create/apply a dev migration (`prisma migrate dev`) |
| `prisma:deploy` | Apply committed migrations (`prisma migrate deploy`) — used in production builds |
| `prisma:push` | Push the schema without a migration |
| `prisma:studio` | Open Prisma Studio |
| `prisma:generate-admin` | Create the first admin account from the `ADMIN_*` variables |
| `seed:tarrifs` | Seed the tarrif plans |

## Repository layout

```
apps/
  admin/            Staff panel (Next.js)
  client/           Public site (Next.js)
packages/
  auth/             Auth.js config, split per app
  db/               Prisma schema, migrations, generated client
  dieline-core/     Geometry engine (maker.js): shapes, models, drawer, exporter
  lib/              Shared helpers, constants, SMS and PDF utilities
  store/            Redux store: slices, selectors, types
  ui/               Shared component library (framework-agnostic)
  eslint-config/    Shared ESLint config
  typescript-config/Shared tsconfig bases
scripts/
  check-import-case.mjs
```

### Where things live

- **`packages/ui` must stay free of Next.js imports.** Its components are shared
  by both apps, but a Next.js import inside the package makes Vercel detect a
  third deployable app. Components that need `next/link`, `next/navigation` or
  `next/image` therefore live in the app that uses them, under
  `apps/*/components/custom/`. Some of those files are intentionally duplicated
  between the two apps — if you change one, change its twin.
- **`packages/dieline-core`** is the geometry engine and is framework-agnostic.
- **`packages/db`** owns the schema *and* the generated client. The generated
  client is **git-ignored**, so `prisma:generate` must run before any build.

## How the two apps share a database

There is no HTTP call between `client` and `admin`: both import `@repo/db` and
talk to the same PostgreSQL database directly, and the only cross-app links are
ordinary browser links (the admin links out to the public site).

Authentication is configured per app through `AUTH_APP`:

- `admin` authenticates the `Admin` table, `client` the `User` table.
- The admin's session cookie is **namespaced** and its signing key is derived
  from `AUTH_SECRET` with a suffix, so the two sessions stay independent.
- `AUTH_APP` is baked in at build time by each app's `next.config`, so it does
  not need to be set as an environment variable.

## Environment

`apps/client/.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (single source of truth) |
| `DATABASE_HOST` `DATABASE_USER` `DATABASE_PASSWORD` `DATABASE_NAME` `DATABASE_PORT` | Fallback used to build the connection string when `DATABASE_URL` is absent |
| `AUTH_SECRET` | Auth.js signing key |
| `AUTH_APP` | `client` |
| `ZARINPAL_MERCHANT_ID`, `ZARINPAL_ACCESS_TOKEN` | Payment gateway |
| `KAVENEGAR_API` | SMS API key |
| `NEXTJS_PUBLIC_MAIN_URL` | Public origin, used for absolute URLs (payment callback, sitemap) |

`apps/admin/.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` (+ the `DATABASE_*` fallbacks) | As above |
| `AUTH_SECRET` | Auth.js signing key |
| `AUTH_APP` | `admin` |
| `CLOUDINARY_URL` | Image uploads |
| `NEXTJS_PUBLIC_MAIN_URL` | Public site origin, for links out of the panel |

Then a seed-only group read by `packages/db` to create the first admin:
`ADMIN_EMAIL`, `ADMIN_FULLNAME`, `ADMIN_PASSWORD`, `ADMIN_PHONENUMBER`.

> `DATABASE_URL` is required at **build** time as well: `@repo/db` throws on
> import when no connection string is configured.

## Deployment

Each app is deployed as its **own Vercel project** on its own domain — the
public site on the root domain, the admin on a subdomain. There is no shared
path prefix and no `services` configuration.

For both projects set **Root Directory** to `apps/client` / `apps/admin`. Each
app ships a `vercel.json` whose build command applies migrations, generates the
Prisma client (it is not committed) and — for the admin — creates the first admin
account, before building:

```bash
# apps/client/vercel.json
pnpm --filter @repo/db run prisma:deploy \
  && pnpm --filter @repo/db run prisma:generate \
  && pnpm run build

# apps/admin/vercel.json
pnpm --filter @repo/db run prisma:deploy \
  && pnpm --filter @repo/db run prisma:generate \
  && pnpm --filter @repo/db prisma:generate-admin \
  && pnpm run build
```

Both projects deploy against the **same database**, so `prisma:deploy` runs twice
per release — it is idempotent, but it does mean either project can apply a
pending migration.

Set every variable from the [Environment](#environment) section in the matching
project (Production and Preview as needed), and use a **different `AUTH_SECRET`
per app**.

### A note on the build tool

Both apps build and run dev with the **webpack** compiler rather than Turbopack
(`next build --webpack`, `next dev --webpack`). Turbopack needs to create
symlinks under `.next/node_modules/` for native packages such as `bcrypt`, which
fails in environments where symlink creation is restricted. Webpack avoids that
requirement entirely. Turbopack is measurably faster, so if your environment
allows symlinks you can switch the scripts back.

## Things worth knowing

- **Serverless functions are frozen when they respond.** Any third-party call
  must be *awaited* before returning. The Kavenegar SDK is callback-only and
  returns nothing, so `packages/lib/src/sms.ts` promisifies it deliberately —
  without that, SMS appear to send locally but are silently dropped in
  production.
- **Prisma client is generated, not committed.** After a schema change run
  `prisma:generate`, and remember that production builds must too.
- **Path casing matters.** See `pnpm check:case` above.
- **A DB-reading page with nothing dynamic gets frozen at build time.** Next.js
  only renders a page per request if something forces it to — `searchParams`, a
  cookie/`session()` read, or an explicit `export const dynamic =
  "force-dynamic"`. A plain `async` page that only awaits Prisma is prerendered
  once at build time and then served from the full route cache, so edits appear
  only after a redeploy: `router.refresh()` just re-fetches the same cached
  render. Every DB page in `apps/admin` therefore either takes `searchParams` or
  sets `force-dynamic`; keep that up when adding pages, and check with the `ƒ` /
  `○` column of `pnpm build`.
- **The dieline editor's state lives in `packages/store`** and is shared by the
  admin editor and the public product page.
