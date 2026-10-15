"use server";

import Kavenegar from "kavenegar";

/**
 * Kavenegar's SDK is callback-only: `request()` calls the callback and returns
 * nothing, so a call that is never awaited resolves instantly.
 *
 * That is invisible on a long-lived dev server — the process stays alive, the
 * socket finishes in the background and the SMS arrives. On Vercel it is fatal:
 * the serverless function is frozen as soon as the response is sent, so the
 * in-flight request never reaches Kavenegar. The SMS is silently lost and the
 * Kavenegar panel shows nothing at all. Every call must therefore be awaited
 * through a promise, which keeps the function alive until Kavenegar answers.
 */

/** Long enough for a slow mobile network, short enough to fail before Vercel's function limit. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Kavenegar returns HTTP-shaped statuses; only 200 means "accepted". */
const KAVENEGAR_OK = 200;

function convertPersianDigitsToEnglish(input: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return input.replace(/[۰-۹]/g, (char) => String(persianDigits.indexOf(char)));
}

type VerifyLookupParams = {
  receptor: string;
  token: string;
  template: string;
};

type VerifyLookupResult = {
  status: number;
  message: string;
};

/**
 * Promisified `VerifyLookup`.
 *
 * The callback contract of the SDK is:
 *   - success:            (entries, status, message) from Kavenegar's response
 *   - unparseable body:   ([], 500, message)
 *   - transport failure:  (JSONstring)  — a single argument, no status
 */
function verifyLookup(
  apikey: string,
  params: VerifyLookupParams,
): Promise<VerifyLookupResult> {
  const api = Kavenegar.KavenegarApi({ apikey });

  // @types/kavenegar does not model the single-argument transport-error call,
  // hence the looser callback signature.
  const lookup = api.VerifyLookup.bind(api) as (
    data: VerifyLookupParams,
    callback: (entries: unknown, status?: number, message?: string) => void,
  ) => void;

  return new Promise((resolve, reject) => {
    let settled = false;

    const settle = (finish: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      finish();
    };

    const timer = setTimeout(
      () =>
        settle(() =>
          reject(
            new Error(
              `Kavenegar did not respond within ${REQUEST_TIMEOUT_MS}ms`,
            ),
          ),
        ),
      REQUEST_TIMEOUT_MS,
    );

    lookup(params, (entries, status, message) => {
      if (typeof entries === "string") {
        // Transport failure: the SDK hands back a JSON string and no status.
        settle(() => reject(new Error(`Kavenegar request failed: ${entries}`)));
        return;
      }

      if (status !== KAVENEGAR_OK) {
        settle(() =>
          reject(
            new Error(
              `Kavenegar rejected the lookup (status ${status}): ${message}`,
            ),
          ),
        );
        return;
      }

      settle(() => resolve({ status, message: message ?? "" }));
    });
  });
}

export const sendOtpSms = async (phoneNumber: string, otp: string) => {
  // Read at call time so a missing/mis-scoped variable says so in the logs
  // instead of producing a request against `/v1/undefined/...`.
  const apikey = process.env.KAVENEGAR_API;

  if (!apikey) {
    console.error(
      "KAVENEGAR_API is not set for this deployment, so no SMS was sent.",
    );
    return { error: "Error Sending SMS" };
  }

  try {
    const result = await verifyLookup(apikey, {
      receptor: convertPersianDigitsToEnglish(phoneNumber),
      token: otp,
      template: "pacsaz",
    });

    console.log(
      `Kavenegar lookup accepted for ${phoneNumber}: ${result.status} ${result.message}`,
    );

    return { success: "Code Sent." };
  } catch (error) {
    // Surfaces in Vercel's runtime logs together with the real reason.
    console.error("Error Sending SMS:", error);
    return { error: "Error Sending SMS" };
  }
};
