import type { CustomizeProblem } from "@repo/dieline-engine";
import type { CustomizeStrings, FoldPreviewStrings } from "@repo/editor";

const fa = (n: number) => n.toLocaleString("fa-IR", { maximumFractionDigits: 1 });

/** Library parts by id. Templates' own parts keep the name the designer gave them. */
const PARTS: Record<string, string> = {
  "lib:tuckLid": "درب تاشو (تاک)",
  "lib:dustFlap": "بال گردگیر",
  "lib:glueFlap": "لبه چسب",
  "lib:slottedFlap": "بال شکاف‌دار (FEFCO)",
  "lib:plainFlap": "بال ساده",
  "lib:thumbNotch": "جای انگشت",
};

const PARAMS: Record<string, string> = {
  depth: "عمق",
  tuck: "عمق زبانه",
  taper: "شیب",
  shoulder: "طول شیب",
  round: "شعاع گوشه",
  slot: "عرض شکاف",
  insetStart: "شیب ابتدا",
  insetEnd: "شیب انتها",
  radius: "شعاع",
  position: "مکان از وسط",
};

const PANELS: Record<string, string> = {
  front: "جلو",
  back: "پشت",
  side1: "کناره ۱",
  side2: "کناره ۲",
};

function problem(p: CustomizeProblem): string {
  switch (p.code) {
    case "outsidePanel":
      return "پنجره باید داخل وجه و با فاصله از خطوط تا و برش باشد.";
    case "overlap":
      return "پنجره‌ها بیش از حد به هم نزدیک‌اند.";
    case "tooSmall":
      return "اندازه‌ی پنجره خیلی کوچک است.";
    case "tooMany":
      return "تعداد پنجره‌ها از حد مجاز بیشتر است.";
    case "outOfRange":
      return "مقدار واردشده خارج از محدوده‌ی مجاز است.";
    case "tooFar":
      return "این بخش بیش از حد مجاز جابه‌جا شده است.";
    case "geometry":
      return "این تغییر با خطوط برش یا تای قالب تداخل دارد.";
    default:
      return "این تغییر برای این قالب مجاز نیست.";
  }
}

export const FA_CUSTOMIZE: Partial<CustomizeStrings> = {
  dir: "rtl",
  options: "گزینه‌ها",
  parts: "بخش‌های اختیاری",
  edges: "بال‌ها و درب‌ها",
  cutouts: "پنجره و سوراخ",
  problems: "بررسی تولید",
  nothingToCustomize: "این قالب گزینه‌ی ویرایش پیشرفته ندارد.",
  allGood: "آماده‌ی تولید",
  auto: "خودکار",
  reset: "بازنشانی",
  resetAll: "بازگشت به قالب اصلی",
  show: "نمایش",
  moveX: "جابه‌جایی افقی",
  moveY: "جابه‌جایی عمودی",
  none: "بدون بال (لبه‌ی ساده)",
  addRect: "پنجره‌ی مستطیل",
  addEllipse: "پنجره‌ی گرد",
  rect: "پنجره‌ی مستطیل",
  ellipse: "پنجره‌ی گرد",
  panel: "وجه",
  width: "عرض",
  height: "ارتفاع",
  offsetX: "فاصله‌ی افقی از وسط",
  offsetY: "فاصله‌ی عمودی از وسط",
  radius: "شعاع گوشه",
  remove: "حذف",
  fit: "نمایش کامل",
  dragHint: "پنجره‌ها و بخش‌های متحرک را روی نقشه بکشید.",
  maxCutouts: (count, max) => `${fa(count)} از ${fa(max)}`,
  sides: { top: "بالا", bottom: "پایین", left: "لبه‌ی چپ", right: "لبه‌ی راست" },
  component: (id, name) => PARTS[id] ?? name,
  param: (name, label) => PARAMS[name] ?? label,
  panelName: (name) => PANELS[name] ?? name,
  problem,
};

export const FA_FOLD: Partial<FoldPreviewStrings> = {
  title: "پیش‌نمایش سه‌بعدی",
  fold: "میزان تا شدن",
  close: "بستن",
  loading: "در حال بارگذاری…",
  pending: "در حال ساخت مدل…",
  empty: "خطی برای تا کردن وجود ندارد.",
  failed: "این قالب قابل تا کردن نیست.",
  expand: "نمای بزرگ",
  shrink: "نمای کوچک",
};
