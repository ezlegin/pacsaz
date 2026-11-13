import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app runs as its own container on its own domain (admin.pacsaz.ir),
  // so it owns its root and needs no base path.
  //
  // The two apps are built from the same packages but run different Auth.js
  // configurations. Baking the value in here keeps each deployment correct
  // without relying on getting an environment variable right.
  env: {
    AUTH_APP: "admin",
    // Exposed to the client ONLY as a boolean so the contacts UI can state
    // whether reply delivery is live. The key itself stays server-side and the
    // Resend SDK is never imported from a client component.
    NEXT_PUBLIC_MAIL_CONFIGURED: process.env.RESEND_API_KEY ? "true" : "",
  },
  // This monorepo sits inside the user profile, where an unrelated
  // package-lock.json makes Next.js infer `C:\Users\<user>` as the workspace
  // root. That made Turbopack crawl the entire home directory, so pin the root
  // to the actual monorepo root instead.
  turbopack: {
    root: path.join(appDir, "..", ".."),
  },
  // Production runs in Docker: `standalone` copies only the files the server
  // needs (traced from the monorepo root, so workspace packages are included)
  // into .next/standalone, which keeps the image small.
  output: "standalone",
  outputFileTracingRoot: path.join(appDir, "..", ".."),
  transpilePackages: ["@repo/ui", "@repo/editor", "@repo/dieline-engine"],
  poweredByHeader: false,
  // The panel is never framed by anyone (DENY stops clickjacking a staff
  // session into clicking a delete), and search engines have no business here.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
