import Credentials from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { prisma } from "@repo/db";

export default {
  pages: {
    signIn: "/login",
  },
  // Vercel terminates TLS and proxies the request, so the host Auth.js would
  // infer is not the public one. Without this, production requests are rejected
  // with `UntrustedHost`.
  trustHost: true,
  // Shares the deployment's AUTH_SECRET. The admin app derives its own key from
  // the same value with a suffix, so the two apps' session tokens are not
  // interchangeable even if they ever end up on one domain.
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await await prisma.user.findFirst({
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
      id: "user-login",
      name: "User Login",
      credentials: {
        phoneNumber: {},
      },
      authorize: async (credentials) => {
        const { phoneNumber } = credentials as {
          phoneNumber: string;
        };

        if (!phoneNumber) {
          throw new Error("لطفا اطلاعات را وارد کنید.");
        }

        const user = await prisma.user.findFirst({ where: { phoneNumber } });
        if (!user) throw new Error("User Not Found");

        return { id: user.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
