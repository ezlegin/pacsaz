import clientConfig from "./client.config";
import adminConfig from "./admin.config";
import { NextAuthConfig } from "next-auth";

const target = process.env.AUTH_APP as "client" | "admin";

let config: NextAuthConfig;

switch (target) {
  case "client":
    config = clientConfig;
    break;
  case "admin":
    config = adminConfig;
    break;
}

export default config;
