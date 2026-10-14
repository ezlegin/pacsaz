import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
export * from "../generated/prisma/client";
export * from "../generated/prisma/models";

/**
 * `DATABASE_URL` is the single source of truth: the Prisma CLI reads it through
 * `prisma.config.ts`, so the runtime must use the exact same value. The discrete
 * `DATABASE_*` variables are still supported as a fallback for environments that
 * only provide those.
 */
const buildConnectionStringFromParts = () => {
  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME;
  const port = process.env.DATABASE_PORT
    ? Number(process.env.DATABASE_PORT)
    : 5432;

  if (!host || !user || !password || !database) return undefined;

  // Credentials must be percent-encoded, otherwise characters like "@" or ":"
  // inside the password would be parsed as URL structure.
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${host}:${port}/${database}?schema=public`;
};

const connectionString =
  process.env.DATABASE_URL || buildConnectionStringFromParts();

if (!connectionString)
  throw new Error(
    "Database connection is not configured. Set DATABASE_URL (or DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD and DATABASE_NAME). [prisma.ts]",
  );

/** How many connections this client may hold open against PostgreSQL. */
const CONNECTION_LIMIT = Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5);

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString,
    max: CONNECTION_LIMIT,
    // Fail fast with a readable reason instead of hanging on a dead server.
    connectionTimeoutMillis: 4000,
  });

  return new PrismaClient({ adapter });
};

/**
 * Next.js reloads this module on every hot update (and Turbopack can instantiate
 * it once per bundle). A fresh `PrismaClient` per evaluation would open a whole
 * new pool of `CONNECTION_LIMIT` sockets and never close the previous one, which
 * exhausts PostgreSQL's connection slots after a handful of edits and then fails
 * with "sorry, too many clients already" (FATAL 53300).
 *
 * Caching on `globalThis` keeps exactly one pool per server process in dev, while
 * a production server (where `globalThis` is not shared across reloads) still gets
 * a normal per-process singleton.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
