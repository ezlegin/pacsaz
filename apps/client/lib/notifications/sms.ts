import Kavenegar from "kavenegar";

/**
 * Outbound transactional SMS through Kavenegar.
 *
 * Only the OTP flow uses `VerifyLookup`, because only it has a panel template
 * (`pacsaz`). Everything else — including the cron warnings — is plain text sent
 * through `Send`, so the wording lives in code (see `buildExpiringSms` et al.)
 * and needs no template approval.
 *
 * Two constraints follow from that:
 *   - The text is ours, so every message must be written to fit an SMS.
 *     `MAX_MESSAGE_LENGTH` guards against a message silently growing past a
 *     single segment as copy changes.
 *   - `Send` is plain-text only: no newlines are expected by the gateway, so the
 *     messages below are written as a single run of text.
 *
 * The callback caveat from `@repo/lib/sms` applies here too: the SDK is
 * callback-only, so a call that is never awaited resolves instantly. On Vercel
 * the function freezes as soon as the response is sent, the in-flight request
 * never reaches Kavenegar and the SMS is silently lost. Every send is therefore
 * wrapped in a promise that keeps the function alive until Kavenegar answers.
 */

/** Long enough for a slow mobile network, short enough to fail before the function limit. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Kavenegar returns HTTP-shaped statuses; only 200 means "accepted". */
const KAVENEGAR_OK = 200;

/**
 * Ceiling for a single message body, in characters. The bodies below are
 * written to land in one or two UCS-2 segments; this guard fails loudly instead
 * of letting a future edit quietly multiply the cost per recipient.
 */
const MAX_MESSAGE_LENGTH = 320;

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Kavenegar only accepts ASCII digits in `receptor`. */
const toLatinDigits = (input: string) =>
  input.replace(/[۰-۹]/g, (char) => String(PERSIAN_DIGITS.indexOf(char)));

/**
 * Persian digits for message bodies, so a number in an otherwise Persian
 * sentence does not render as Latin (`تنها 2 مورد` vs `تنها ۲ مورد`).
 */
const toPersianDigits = (input: string) =>
  input.replace(/\d/g, (char) => PERSIAN_DIGITS[Number(char)]!);

export type SendSmsResult = { ok: true } | { ok: false; reason: string };

type KavenegarCallback = (
  entries: unknown,
  status?: number,
  message?: string,
) => void;

type KavenegarSendParams = {
  receptor: string;
  message: string;
  sender: string;
};

/**
 * Promisified transport shared by every message.
 *
 * The callback contract of the SDK (see `KavenegarApi.prototype.request`) is:
 *   - success:            (entries, status, message)
 *   - unparseable body:   ([], 500, message)
 *   - transport failure:  (JSONstring) — a single argument, no status
 */
function request(
  apikey: string,
  params: KavenegarSendParams,
): Promise<{ status: number; message: string }> {
  const api = Kavenegar.KavenegarApi({ apikey });

  // The SDK's callback type only models the success case, while the transport
  // also calls back with a single JSON string on failure, so the signature is
  // widened here through `unknown`.
  const send = api.Send.bind(api) as unknown as (
    data: KavenegarSendParams,
    callback: KavenegarCallback,
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

    send(params, (entries, status, message) => {
      if (typeof entries === "string") {
        // Transport failure: the SDK hands back a JSON string and no status.
        settle(() => reject(new Error(`Kavenegar request failed: ${entries}`)));
        return;
      }

      if (status !== KAVENEGAR_OK) {
        settle(() =>
          reject(
            new Error(
              `Kavenegar rejected the send (status ${status}): ${message}`,
            ),
          ),
        );
        return;
      }

      settle(() => resolve({ status, message: message ?? "" }));
    });
  });
}

/**
 * Sends one plain-text SMS.
 *
 * Never throws: delivery problems are returned so the caller can record a
 * `failed` notification row and continue with the remaining recipients.
 */
export const sendSms = async ({
  message,
  phone,
}: {
  message: string;
  phone: string;
}): Promise<SendSmsResult> => {
  // Read at call time so a missing/mis-scoped variable says so in the logs
  // instead of producing a request against `/v1/undefined/...`.
  const apikey = process.env.KAVENEGAR_API;
  const sender = process.env.KAVENEGAR_SENDER;

  if (!apikey || !sender) {
    console.error(
      "KAVENEGAR_API / KAVENEGAR_SENDER is not set for this deployment, so no SMS was sent. [lib/notifications/sms.ts]",
    );
    return { ok: false, reason: "Kavenegar credentials are not configured." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    // A programming error rather than a delivery failure, but returning it keeps
    // the contract uniform and surfaces it in the notification log.
    return {
      ok: false,
      reason: `SMS body is ${message.length} characters, over the ${MAX_MESSAGE_LENGTH} limit.`,
    };
  }

  const receptor = toLatinDigits(phone);

  try {
    const result = await request(apikey, { message, sender, receptor });
    console.log(
      `Kavenegar Send accepted for ${receptor}: ${result.status} ${result.message}`,
    );
    return { ok: true };
  } catch (error) {
    // Surfaces in the runtime logs together with the real reason.
    console.error("Error Sending SMS:", error);
    return { ok: false, reason: (error as Error).message };
  }
};

//! ---------------------------------------------------------------------------
//! Message copy
//!
//! Written in code because plain-text SMS has no panel template. Kept terse and
//! formal, each a single line, and each ending with the site address so the
//! recipient knows where to act without a link shortener.
//!
//! Length is a real constraint: Persian forces UCS-2 encoding, which fits only
//! 70 characters per segment (67 per segment once concatenated), and the emoji
//! alone costs two characters. These are written to stay within two segments.
//! `scripts/test-sms.ts` prints the character count and segment estimate.
//! ---------------------------------------------------------------------------

/** Subscription is about to expire. */
export const buildExpiringSms = ({
  planTitle,
  endsAtLabel,
}: {
  planTitle: string;
  endsAtLabel: string;
}): string =>
  `پک‌ساز | اشتراک «${planTitle}» شما تا ${endsAtLabel} اعتبار دارد. ⏳ برای تمدید به pacsaz.ir مراجعه کنید`;

/** Fair-download quota is nearly used up. */
export const buildDownloadsSms = ({
  remaining,
  planTitle,
}: {
  remaining: number;
  planTitle: string;
}): string =>
  `پک‌ساز | از سهمیه دانلود «${planTitle}» شما ${toPersianDigits(String(remaining))} مورد باقی مانده. ⚠️ برای ارتقای پلن به pacsaz.ir مراجعه کنید`;
