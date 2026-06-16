import { handlers } from "@repo/auth";

const targetApp = process.env.AUTH_APP as "client" | "admin";

if (!targetApp || targetApp !== "admin") {
  throw new Error(
    "AUTH_APP not defined. Try do define it in the .env file. [api/auth/route.ts]",
  );
}

export const { GET, POST } = handlers;
