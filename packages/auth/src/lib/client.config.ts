import Credentials from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { prisma } from "@repo/db";
import { rateLimit, resetRateLimit } from "@repo/db/data/rateLimit";

/** Wrong guesses allowed per SMS code. */
const MAX_ATTEMPTS = 5;

export default {
  pages: {
    signIn: "/login",
  },
  // nginx-proxy terminates TLS and proxies the request, so the host Auth.js would
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
        code: {},
      },
      /**
       * The only way into a user account: the phone number and the live SMS
       * code for it. Each wrong guess is counted and the code dies after five.
       * A first successful sign-in creates the account.
       */
      authorize: async (credentials) => {
        const phoneNumber = String(credentials?.phoneNumber ?? "");
        const code = String(credentials?.code ?? "");
        if (!/^09\d{9}$/.test(phoneNumber) || !/^\d{5}$/.test(code)) return null;

        // Five guesses per code, and 15 per number a day across codes, so
        // requesting a fresh code every two minutes does not reopen guessing.
        if (!(await rateLimit(`otp-guess:${phoneNumber}`, 15, 86_400)).ok) return null;

        const otp = await prisma.otp.findFirst({
          where: { phoneNumber, expiresAt: { gt: new Date() } },
          orderBy: { id: "desc" },
        });
        if (!otp || otp.attempts >= MAX_ATTEMPTS) return null;

        if (otp.code !== code) {
          await prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
          return null;
        }

        // Used once: a second sign-in with the same code finds nothing.
        await prisma.otp.deleteMany({ where: { phoneNumber } });
        await resetRateLimit(`otp-guess:${phoneNumber}`);

        const user =
          (await prisma.user.findUnique({ where: { phoneNumber } })) ??
          (await prisma.user.create({
            data: { email: "", firstName: "کاربر", fullName: "کاربر", phoneNumber },
          }));

        return { id: user.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
