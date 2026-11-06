import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { cache } from "react";

export type CurrentAdmin = { id: number; fullName: string; email: string };

/**
 * The admin behind the current request, or null.
 *
 * The session token alone is not enough: an admin deleted after signing in still
 * holds a valid token, so the row is looked up. Cached per request, because the
 * layout, the page and every action of one request ask for it.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  return prisma.admin.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true },
  });
});

export class UnauthorizedError extends Error {
  constructor() {
    super("Your session has ended. Please log in again.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Guard for every server action and private page.
 *
 * A server action is a public POST endpoint whatever page imports it, and the
 * proxy lets /login through, so each action has to check the caller itself.
 * Called before an action's own try/catch, it throws and the action does
 * nothing.
 */
export const requireAdmin = async (): Promise<CurrentAdmin> => {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
};
