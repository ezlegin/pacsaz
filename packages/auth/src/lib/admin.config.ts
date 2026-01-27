import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminById, getAdminByEmail } from "../data/admin";

export default {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await getAdminById(+user.id!);
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
        const { email } = credentials as {
          email: string;
        };

        if (!email) {
          throw new Error("Invalid Credentials");
        }

        const admin = await getAdminByEmail(email);
        if (!admin) throw new Error("User Not Found");

        return { id: admin.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
