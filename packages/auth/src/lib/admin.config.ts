import { prisma } from "@repo/db";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export default {
  pages: {
    signIn: "/login",
  },
  trustHost: process.env.NODE_ENV === "development" ? true : false,
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

        if (!email) {
          throw new Error("Invalid Credentials");
        }

        const admin = await prisma.admin.findFirst({ where: { email } });
        if (!admin) throw new Error("Invalid Credentials");

        const isValidPassword = await bcrypt.compare(admin.password, password);
        if (!isValidPassword) throw new Error("Invalid Credentials");

        return { id: admin.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
