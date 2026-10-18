import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    /**
     * Scratch database Prisma uses to replay migrations while computing a diff.
     * Optional: the app never needs it, only `migrate dev` and `migrate diff`.
     */
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
