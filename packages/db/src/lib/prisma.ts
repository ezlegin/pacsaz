import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
export * from "../generated/prisma/client";
export * from "../generated/prisma/models";

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;
const port = process.env.DATABASE_PORT
  ? Number(process.env.DATABASE_PORT)
  : 3306;

if (!host || !user || !password || !database)
  throw new Error("DB envs are not provided. [prisma.ts]");

/** How many connections this client may hold open against MySQL. */
const CONNECTION_LIMIT = Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5);

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: CONNECTION_LIMIT,
    allowPublicKeyRetrieval: true,
    // Fail fast with a readable reason instead of hanging for 10s on a dead server.
    connectTimeout: 4000,
  });

  return new PrismaClient({ adapter });
};

/**
 * Next.js reloads this module on every hot update (and Turbopack can instantiate
 * it once per bundle). A fresh `PrismaClient` per evaluation would open a whole
 * new pool of `CONNECTION_LIMIT` sockets and never close the previous one, which
 * exhausts MySQL's `max_connections` after a handful of edits and then fails with
 * "pool timeout ... active=0 idle=0" (really ER_CON_COUNT_ERROR 1040).
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
