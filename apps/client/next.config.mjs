import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The two services are built from the same packages but run different Auth.js
  // configurations. Baking the value in here keeps each service correct without
  // relying on per-service environment variables.
  env: {
    AUTH_APP: "client",
  },
  // This monorepo sits inside the user profile, where an unrelated
  // package-lock.json makes Next.js infer `C:\Users\<user>` as the workspace
  // root. That made Turbopack crawl the entire home directory, so pin the root
  // to the actual monorepo root instead.
  turbopack: {
    root: path.join(appDir, "..", ".."),
  },
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
