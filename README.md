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

## Notification bar

A thin announcement bar pinned to the top of **every page of the client site**,
the user panel included.

- Set it in the admin panel under **Notification** (`/notification`).
- **Text** is required. The **CTA button** (title + link, rendered with
  `next/link`) and the **countdown** are both optional — leave either out and the
  bar renders without it.
- While a deadline is set, visitors see a live `DD : HH : MM : SS` countdown, and
  the bar removes itself once the deadline passes. Switching **Active** off hides
  it everywhere.
- It is a single `NotificationBar` row (`id: 1`) that both apps read, so saving in
  the admin changes the public site immediately — no redeploy, because the client
  reads it per request.

The bar itself lives in `packages/ui` and stays Next-free; the app supplies the
CTA so the link can use `next/link`. Only the client renders the bar — the admin
side of this feature is the settings page.

Height is `--notification-bar-height`. When a bar is present,
`body:has([data-notification-bar])` sets `--app-top-offset` to that height, and
the shared sidebar plus the full-height client containers subtract it, so nothing
is hidden behind the bar. With no notification configured the offset is `0` and
every layout behaves exactly as it did before.

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
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email |
| `CRON_SECRET` | Shared secret the scheduled-job route verifies |
| `NEXT_PUBLIC_MAIN_URL` | Public origin. Absolute URLs (payment callback, canonical links, `robots.txt`, `sitemap.xml`) are built from it |
| `GOOGLE_SITE_VERIFICATION` | Optional. Emits the Search Console verification meta tag |

> **`NEXT_PUBLIC_MAIN_URL`, not `NEXTJS_PUBLIC_MAIN_URL`.** Both apps read the
> former (see `apps/client/lib/consts.ts` and `apps/admin/data/envs.ts`), so a
> value set under the `NEXTJS_` spelling is ignored and the code falls back to the
> hardcoded `https://pacsaz.ir`. That fallback is the production domain, which is
> why the mistake is invisible until the site is served somewhere else — and then
> every canonical link, `og:url` and sitemap entry points at the wrong host. Check
> the spelling in Vercel as well as in the local `.env` files.

`apps/admin/.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` (+ the `DATABASE_*` fallbacks) | As above |
| `AUTH_SECRET` | Auth.js signing key |
| `AUTH_APP` | `admin` |
| `CLOUDINARY_URL` | Image uploads |
| `NEXT_PUBLIC_MAIN_URL` | Public site origin, for links out of the panel |

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

> **Schema changes that have no migration file need `db push`.** `prisma:deploy`
> only applies what is in `packages/db/src/prisma/migrations`. When a model is
> added by pushing the schema instead of generating a migration, every database
> that must have it — production included — needs
> `pnpm --filter @repo/db exec prisma db push` against that database.

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

## SEO and AI crawlers

Everything a crawler reads is generated from data, not written by hand, so the
markup cannot drift from the catalogue.

| Concern | Where it lives |
| --- | --- |
| Brand constants (name, origin, contact, social) | `apps/client/lib/seo/site.ts` |
| schema.org graph builders | `apps/client/lib/seo/schema.ts` |
| Next.js metadata helpers | `apps/client/lib/seo/metadata.ts` |
| Crawler policy (which bots, which paths) | `apps/client/lib/seo/routes.ts` |
| `<script type="application/ld+json">` renderer | `apps/client/components/JsonLd.tsx` |

Routes the client publishes for crawlers: `/robots.txt`, `/sitemap.xml`,
`/manifest.webmanifest`, `/llms.txt` and `/llms-full.txt`.

Rules worth keeping:

- **Every page's metadata goes through `buildMetadata`.** Next.js merges
  `metadata` shallowly, so a page that sets only `openGraph` silently drops the
  parent's canonical, robots directives and Twitter card. The helper repeats them.
- **`metadataBase` is set once, in `app/layout.tsx`.** Without it the relative
  `og:image` and canonical paths resolve to nothing.
- **Graph nodes are joined by `@id`, not repeated.** `Organization` and `WebSite`
  are declared once in the root layout; every other node references them. An `@id`
  reference with no target makes the entity look inconsistent to Google.
- **A page must never be both `Disallow`ed and linked.** `robots.ts` and
  `sitemap.ts` both derive from `lib/seo/routes.ts` for that reason.
- **Session-gated routes are `noindex` *and* disallowed.** `Disallow` stops the
  crawl; only `noindex` keeps a URL out of the index.
- **Categories are real routes.** `/dielines/category/<slug>` has its own title,
  `h1`, breadcrumb and `ItemList`. The old `?category=` form permanently redirects
  there, so it is not indexed as a near-duplicate of `/dielines`.
- **`Dieline.specification` is JSON**, not prose — it is a geometry document the
  editor parses. Never render it as text; `lib/seo/schema.ts` builds descriptions
  from `title`, the size columns and `materials` instead.

### Checking your work

With the production server running:

```bash
python apps/client/scripts/audit.py http://localhost:3000      # titles, canonicals, robots, JSON-LD graph
python apps/client/scripts/jsonld.py http://localhost:3000 /dieline/<slug>
```

`audit.py` validates the JSON-LD as a graph: dangling `@id` references,
`Product` nodes missing required fields, breadcrumb positions that are not
sequential, and `numberOfItems` disagreeing with the list it counts. It exits
non-zero on failure, so it can gate a deploy.

Two of its checks are data-conditional and report as warnings on an empty
database: the sitemap carries no category or dieline URLs, and the catalogue
section of `llms.txt` is absent. Seed the catalogue before treating those as
failures.

The icon set is generated, not hand-drawn — change the artwork and re-run:

```bash
python apps/client/scripts/icons.py   # favicon.ico, apple-touch-icon.png, icon-192/512.png
```

### AI discovery

`robots.txt` names the answer-engine and training crawlers explicitly rather than
leaving them to `*`, so the policy is auditable: `AI_CITATION_BOTS` (fetches a page
to answer a question, links back) and `AI_TRAINING_BOTS` (builds model weights) are
both allowed — blocking either removes the site from the answer without removing it
from the model's knowledge of the web. Content scrapers with no discoverability
upside (`AhrefsBot`, `SemrushBot`, `MJ12bot`) are blocked.

`/llms.txt` is the index and `/llms-full.txt` is the content: the FAQ and terms
verbatim, plus the full dieline catalogue with sizes. Both are generated from the
same sources the pages render.
