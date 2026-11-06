import { UnauthorizedError } from "./session";

/**
 * Turns whatever an action caught into a sentence an admin can act on.
 *
 * Actions used to return `error.name`, which showed "PrismaClientKnownRequestError"
 * when, say, a tariff still had payments. Prisma's common codes are mapped to
 * what they mean here; anything else is logged and reported generically, so
 * database internals never reach the browser.
 */
export const actionError = (error: unknown): string => {
  if (error instanceof UnauthorizedError) return error.message;

  const code = (error as { code?: unknown })?.code;
  switch (code) {
    case "P2002":
      return "Another record already uses this value (it must be unique).";
    case "P2003":
    case "P2014":
      return "This record is still used by other records, so it can't be changed or deleted.";
    case "P2025":
      return "The record was not found. It may have been deleted already.";
  }

  console.error(error);
  return "Something went wrong. Check the server logs.";
};

/** The usual result of an admin action, as `handleRes` expects it. */
export type ActionResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };
