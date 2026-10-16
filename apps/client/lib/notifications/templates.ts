import { siteUrl } from "@/lib/consts";

/**
 * HTML email templates.
 *
 * Every template returns a complete RTL document. Styling is inlined because
 * mail clients strip <style> blocks, and a table-free single-column layout keeps
 * the rendering predictable in Gmail, Outlook and the Iranian clients
 * (Chrome/Android mail, Mail.app) that most of our users read on.
 */

/** Brand accent, matching `--primary` in the app's theme. */
const PRIMARY = "#8c38fe";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type LayoutOptions = {
  /** Inbox preview line; hidden in the body. */
  preheader: string;
  title: string;
  /** Body markup. Must already be trusted/escaped by the caller. */
  body: string;
};

const layout = ({ preheader, title, body }: LayoutOptions) => `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f4f4f5;padding:24px 12px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
      <div style="background:${PRIMARY};padding:18px 24px;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">پک‌ساز</p>
        <p style="margin:4px 0 0;color:#ede9fe;font-size:12px;">طراحی دایلاین بسته‌بندی، بدون آزمون و خطا</p>
      </div>
      <div style="padding:24px;color:${TEXT};font-size:14px;line-height:2;">
        ${body}
      </div>
      <div style="padding:16px 24px;background:#fafafa;border-top:1px solid ${BORDER};color:${MUTED};font-size:11px;line-height:1.9;">
        <p style="margin:0;">این ایمیل از طرف پک‌ساز ارسال شده است.</p>
        <p style="margin:4px 0 0;">
          <a href="${siteUrl}" style="color:${PRIMARY};text-decoration:none;">${siteUrl}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

const paragraph = (text: string) =>
  `<p style="margin:0 0 12px;">${text}</p>`;

const button = (href: string, label: string) =>
  `<p style="margin:20px 0;">
     <a href="${href}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;font-size:14px;">${label}</a>
   </p>`;

const muted = (text: string) =>
  `<p style="margin:12px 0 0;color:${MUTED};font-size:12px;line-height:1.9;">${text}</p>`;

export const formatToman = (value: number) =>
  `${Math.round(value).toLocaleString("en-US")} تومان`;

/** Formats a date as a Jalali date, falling back to the Gregorian one. */
export const formatJalali = (date: Date) => {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

const CTA = `${siteUrl}/subscription`;

//! ---------------------------------------------------------------------------

export const welcomeEmail = ({ fullName }: { fullName: string }) => ({
  subject: "به پک‌ساز خوش آمدید!",
  html: layout({
    preheader: "حساب شما ساخته شد؛ اولین دایلاین خود را بسازید.",
    title: "خوش آمدید",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز، خوش آمدید 🌟`),
      paragraph(
        "حساب کاربری شما در پک‌ساز ساخته شد. از این پس می‌توانید دایلاین بسته‌بندی مورد نیاز خود را در چند ثانیه و با ابعاد دقیق بسازید.",
      ),
      paragraph("با پک‌ساز می‌توانید:"),
      `<ul style="margin:0 0 12px;padding-right:20px;">
         <li style="margin-bottom:6px;">دایلاین را با ابعاد دلخواه و متریال مورد نظر بسازید.</li>
         <li style="margin-bottom:6px;">خطوط برش، تا، بلید و پرفراژ را به‌صورت لایه‌بندی‌شده دریافت کنید.</li>
         <li style="margin-bottom:6px;">خروجی آماده چاپ و برش (PDF و DXF) بگیرید.</li>
         <li>قالب‌های پرکاربرد را ذخیره کنید و روی مشتریان خودتان نگه دارید.</li>
       </ul>`,
      button(`${siteUrl}/dielines`, "مشاهده کتابخانه قالب‌ها"),
      muted(
        `برای ساخت اولین قالب کافی است وارد بخش قالب‌ها شوید. در صورت نیاز به راهنمایی، پاسخ همین ایمیل را ارسال کنید.`,
      ),
    ].join(""),
  }),
});

export const subscriptionExpiringEmail = ({
  fullName,
  planTitle,
  endsAt,
  daysLeft,
  downloads,
}: {
  fullName: string;
  planTitle: string;
  endsAt: Date;
  daysLeft: number;
  downloads: number;
}) => ({
  subject: `اشتراک ${planTitle} شما در حال اتمام است`,
  html: layout({
    preheader: `اشتراک شما تا ${formatJalali(endsAt)} فعال است.`,
    title: "اشتراک در حال اتمام",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز،`),
      paragraph(
        `اشتراک <strong>${escapeHtml(planTitle)}</strong> شما تا <strong>${formatJalali(endsAt)}</strong> (حدود ${daysLeft} روز دیگر) فعال است.`,
      ),
      paragraph(
        `تا این لحظه ${downloads} دانلود از سهمیه این پلن استفاده کرده‌اید. پس از پایان اشتراک، امکان دریافت فایل‌های خروجی بدون واترمارک از کار می‌افتد.`,
      ),
      paragraph("برای اینکه دسترسی شما قطع نشود، همین حالا اشتراک خود را تمدید کنید."),
      button(CTA, "تمدید اشتراک"),
      muted(
        "اگر پیش از پایان اشتراک تمدید کنید، سهمیه دانلود پلن جدید به‌صورت کامل و از ابتدا برای شما فعال می‌شود.",
      ),
    ].join(""),
  }),
});

export const downloadsNearLimitEmail = ({
  fullName,
  planTitle,
  downloaded,
  fairDownload,
  remaining,
}: {
  fullName: string;
  planTitle: string;
  downloaded: number;
  fairDownload: number;
  remaining: number;
}) => ({
  subject: `سهمیه دانلود شما رو به اتمام است (${remaining} دانلود باقی‌مانده)`,
  html: layout({
    preheader: `از ${fairDownload} دانلود این پلن، ${downloaded} مورد استفاده شده است.`,
    title: "سهمیه دانلود در حال اتمام",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز،`),
      paragraph(
        `از سهمیه دانلود اشتراک <strong>${escapeHtml(planTitle)}</strong> شما ${downloaded} مورد از ${fairDownload} استفاده شده و تنها <strong>${remaining} دانلود</strong> باقی مانده است.`,
      ),
      paragraph(
        "برای اینکه وسط پروژه متوقف نشوید، می‌توانید سهمیه خود را با ارتقای پلن افزایش دهید.",
      ),
      button(CTA, "مشاهده و ارتقای پلن"),
      muted(
        "سهمیه دانلود در ابتدای هر دوره اشتراک به‌صورت کامل بازنشانی می‌شود.",
      ),
    ].join(""),
  }),
});

export const paymentSuccessEmail = ({
  fullName,
  planTitle,
  amount,
  periodLabel,
  endsAt,
  fairDownload,
}: {
  fullName: string;
  planTitle: string;
  amount: number;
  periodLabel: string;
  endsAt: Date;
  fairDownload: number;
}) => ({
  subject: `پرداخت موفق — اشتراک ${planTitle} فعال شد`,
  html: layout({
    preheader: `اشتراک ${planTitle} شما تا ${formatJalali(endsAt)} فعال است.`,
    title: "پرداخت موفق",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز،`),
      paragraph("پرداخت شما با موفقیت انجام شد و اشتراک جدید شما فعال شد. 🎉"),
      `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:13px;">
         <tr>
           <td style="padding:10px 12px;border:1px solid ${BORDER};background:#fafafa;width:40%;">پلن</td>
           <td style="padding:10px 12px;border:1px solid ${BORDER};">${escapeHtml(planTitle)}</td>
         </tr>
         <tr>
           <td style="padding:10px 12px;border:1px solid ${BORDER};background:#fafafa;">دوره</td>
           <td style="padding:10px 12px;border:1px solid ${BORDER};">${escapeHtml(periodLabel)}</td>
         </tr>
         <tr>
           <td style="padding:10px 12px;border:1px solid ${BORDER};background:#fafafa;">مبلغ پرداخت‌شده</td>
           <td style="padding:10px 12px;border:1px solid ${BORDER};">${formatToman(amount)}</td>
         </tr>
         <tr>
           <td style="padding:10px 12px;border:1px solid ${BORDER};background:#fafafa;">سهمیه دانلود</td>
           <td style="padding:10px 12px;border:1px solid ${BORDER};">${fairDownload} دانلود</td>
         </tr>
         <tr>
           <td style="padding:10px 12px;border:1px solid ${BORDER};background:#fafafa;">اعتبار تا</td>
           <td style="padding:10px 12px;border:1px solid ${BORDER};">${formatJalali(endsAt)}</td>
         </tr>
       </table>`,
      button(`${siteUrl}/panel`, "ورود به پنل کاربری"),
      muted("در پنل کاربری می‌توانید وضعیت اشتراک و تاریخچه دانلودهای خود را ببینید."),
    ].join(""),
  }),
});

export const paymentFailedEmail = ({
  fullName,
  planTitle,
  amount,
}: {
  fullName: string;
  planTitle: string;
  amount: number;
}) => ({
  subject: "پرداخت شما تکمیل نشد",
  html: layout({
    preheader: "تراکنش شما ناموفق بود؛ می‌توانید دوباره تلاش کنید.",
    title: "پرداخت ناموفق",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز،`),
      paragraph(
        `پرداخت شما برای اشتراک <strong>${escapeHtml(planTitle)}</strong> به مبلغ ${formatToman(amount)} تکمیل نشد و اشتراکی فعال نشد.`,
      ),
      paragraph(
        "اگر مبلغی از حساب شما کسر شده باشد، به‌صورت خودکار توسط درگاه پرداخت بازگردانده می‌شود. در غیر این صورت می‌توانید دوباره تلاش کنید.",
      ),
      button(CTA, "تلاش دوباره برای خرید"),
      muted("اگر چند بار پیاپی با خطا روبه‌رو شدید، پاسخ همین ایمیل را ارسال کنید تا بررسی کنیم."),
    ].join(""),
  }),
});

export const marketingEmail = ({
  fullName,
  code,
  percent,
  expiresAt,
  limit,
}: {
  fullName: string;
  code: string;
  percent: number;
  expiresAt: Date;
  limit: number;
}) => ({
  subject: `کد تخفیف ${percent}٪ این ماه پک‌ساز`,
  html: layout({
    preheader: `کد ${code} با ${percent}٪ تخفیف تا ${formatJalali(expiresAt)}`,
    title: "کد تخفیف این ماه",
    body: [
      paragraph(`${escapeHtml(fullName)} عزیز،`),
      paragraph(
        `کد تخفیف اختصاصی این ماه پک‌ساز برای شما آماده است:`,
      ),
      `<div style="margin:16px 0;padding:18px;border:2px dashed ${PRIMARY};border-radius:12px;background:#faf5ff;text-align:center;">
         <p style="margin:0;color:${MUTED};font-size:12px;">کد تخفیف شما</p>
         <p style="margin:8px 0 0;font-size:24px;font-weight:bold;letter-spacing:3px;color:${PRIMARY};" dir="ltr">${escapeHtml(code)}</p>
         <p style="margin:10px 0 0;font-size:13px;color:${TEXT};"><strong>${percent}٪ تخفیف</strong> روی خرید اشتراک</p>
       </div>`,
      paragraph("شرایط استفاده از این کد:"),
      `<ul style="margin:0 0 12px;padding-right:20px;">
         <li style="margin-bottom:6px;"><strong>${percent}٪ تخفیف</strong> روی مبلغ اشتراک (هر سه پلن استاندارد، حرفه‌ای و سازمانی).</li>
         <li style="margin-bottom:6px;">این کد فقط تا <strong>${formatJalali(expiresAt)}</strong> معتبر است — حدود یک هفته.</li>
         <li style="margin-bottom:6px;">ظرفیت این کد محدود است و فقط برای <strong>${limit} نفر</strong> در نظر گرفته شده؛ پس زودتر استفاده کنید.</li>
         <li>کد تخفیف را در مرحله پرداخت، در بخش «کد تخفیف» وارد کنید.</li>
       </ul>`,
      button(CTA, "استفاده از کد تخفیف"),
      muted(
        "این کد در ابتدای هر ماه برای کاربران پک‌ساز ارسال می‌شود و پس از پایان مهلت یا تکمیل ظرفیت، غیرفعال خواهد شد.",
      ),
    ].join(""),
  }),
});
