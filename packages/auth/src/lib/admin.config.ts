import { prisma } from "@repo/db";
import { adminSessionCookieName, onDevelepe } from "@repo/lib/data/consts";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export default {
  pages: {
    signIn: "/login",
  },
  // Vercel terminates TLS and proxies the request, so the host Auth.js would
  // infer is not the public one. Without this, production requests are rejected
  // with `UntrustedHost`.
  trustHost: true,
  // This app is deployed on its own domain (admin.pacsaz.ir) and authenticates a
  // different account table than the client, so its session cookie is namespaced
  // (the name is shared with apps/admin/proxy.ts) and its signing key is derived
  // from the deployment secret with a suffix. That keeps the two sessions fully
  // independent — worth having because the jwt callback below trusts `token.id`
  // to pick an admin by id.
  cookies: {
    sessionToken: {
      name: adminSessionCookieName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !onDevelepe,
      },
    },
  },
  secret: process.env.AUTH_SECRET
    ? `${process.env.AUTH_SECRET}#admin`
    : undefined,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await prisma.admin.findFirst({
          where: { id: +user.id! },
        });
        if (!existingUser) return token;
        token.id = user.id;
        return token;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error("Invalid Credentials");
        }

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) throw new Error("Invalid Credentials");

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) throw new Error("Invalid Credentials");

        return { id: admin.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
