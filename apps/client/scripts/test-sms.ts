import {
  buildDownloadsSms,
  buildExpiringSms,
  sendSms,
} from "../lib/notifications/sms";

/**
 * One-off check for the plain-text SMS path.
 *
 * Prints the rendered bodies so the copy and its segment count can be eyeballed
 * without spending credit, then — only with `--send` — performs a real `Send`
 * against Kavenegar. The real send is opt-in because it costs money and reaches
 * a live handset.
 *
 * Usage (from apps/client — `.env` must be passed explicitly because a
 * standalone script does not get Next.js's automatic env loading):
 *   node ../node_modules/.pnpm/tsx@4.22.3/node_modules/tsx/dist/cli.mjs \
 *     --env-file=.env scripts/test-sms.ts
 *   ... --send 09127452859
 */
const MAX_MESSAGE_LENGTH = 320;

const expiring = buildExpiringSms({
  planTitle: "حرفه‌ای",
  endsAtLabel: "۲۴ مهر ۱۴۰۵",
});

const downloads = buildDownloadsSms({ remaining: 2, planTitle: "حرفه‌ای" });

const preview = (label: string, message: string) => {
  console.log(`\n--- ${label} ---`);
  console.log(message);
  console.log(`characters: ${message.length} / ${MAX_MESSAGE_LENGTH}`);

  // Persian plus any emoji cannot be encoded as GSM-7, so the carrier falls back
  // to UCS-2: 70 characters in a single segment, 67 per segment once
  // concatenated. Length is measured in UTF-16 code units, which is what UCS-2
  // counts, so `.length` is already the right number.
  const segments = message.length <= 70 ? 1 : Math.ceil(message.length / 67);
  console.log(`estimated segments (UCS-2): ${segments}`);
};

const main = async () => {
  preview("subscription expiring", expiring);
  preview("downloads near limit", downloads);

  const sendIndex = process.argv.indexOf("--send");
  if (sendIndex === -1) {
    console.log("\n(dry run; pass --send <phone> to actually deliver)");
    return;
  }

  const phone = process.argv[sendIndex + 1];
  if (!phone) throw new Error("--send requires a phone number.");

  console.log(`\nsending both messages to ${phone} ...`);
  for (const [label, message] of [
    ["expiring", expiring],
    ["downloads", downloads],
  ] as const) {
    const result = await sendSms({ message, phone });
    console.log(
      `  ${label}: ${result.ok ? "accepted" : `failed — ${result.reason}`}`,
    );
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
