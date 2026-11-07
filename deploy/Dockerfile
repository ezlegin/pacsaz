# Production images for Pacsaz. Built by .github/workflows/build.yml.
#
# The Next.js apps are built on the GitHub runner (next build needs a database
# for pages that query it), and only their `standalone` output is copied in
# here: targets `client` and `admin`. The `tools` target is a small workspace
# install for database work on the server: migrations, the first admin
# account and the seeds.
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------------------------------------------------------------- apps
FROM base AS next-app
ARG APP
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION} HOSTNAME=0.0.0.0
# Prepared by the workflow: .next/standalone with .next/static and public
# copied next to the app's server.js.
COPY --chown=node:node out/${APP}/ ./
USER node
WORKDIR /app/apps/${APP}
CMD ["node", "server.js"]

FROM next-app AS client
ENV PORT=3000
EXPOSE 3000

FROM next-app AS admin
ENV PORT=3001
EXPOSE 3001

# ---------------------------------------------------------------- tools
FROM base AS tools
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
# The seeds import the dieline engine and fold rig by relative path, so those
# packages come along; nothing from apps/ is needed. Dev dependencies stay:
# prisma and tsx are devDependencies of @repo/db.
RUN NODE_ENV=development pnpm install --frozen-lockfile \
      --filter "@repo/db..." --filter "@repo/dieline-engine..." --filter "@repo/dieline-3d..." \
 && pnpm --filter @repo/db exec prisma generate \
 && pnpm store prune
WORKDIR /app/packages/db
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
