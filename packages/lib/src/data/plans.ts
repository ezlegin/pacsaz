import { calculateFairDownload } from "../utils/calculateFairDownload";

export type PlanKey = "standard" | "pro" | "organization";
export type PlanTitle = "استاندارد" | "حرفه‌ای" | "سازمانی";
export type PlanPeriod = "monthly" | "threeMonth" | "annual";
export type PlanLevel = 1 | 2 | 3;
export type PlanFeature = { active: boolean; value: string };
export type PlanFairDownload = {
  monthly: number;
  threeMonth: number;
  annual: number;
};
export interface Plan {
  title: PlanTitle;
  price: number;
  description: string;
  key: PlanKey;
  shortDescription: string;
  level: PlanLevel;
  fairDownload: PlanFairDownload;
  features: PlanFeature[];
}

const generals = [
  { active: true, value: "دسترسی به تمام قالب ها" },
  { active: true, value: "ذخیره نامحدود قالب ها" },
  { active: true, value: "دانلود فرمت دلخواه" },
  { active: true, value: "انتخاب متریال چاپ" },
  { active: true, value: "انتخاب نوع ابعاد" },
  { active: true, value: "دریافت فایل بدون واترمارک" },
];

const paids = [
  { active: true, value: "تنظیم ضخامت سفارشی متریال" },
  { active: true, value: "انتخاب میزان بلید" },
  { active: true, value: "مشاهده ابعاد کامل دایلاین" },
  { active: true, value: "هشدار خطای برش در ابعاد غیر متعارف" },
  { active: true, value: "امکان ذخیره قالب با نام دلخواه و استفاده مجدد" },
  { active: true, value: "اضافه کردن مشتریان" },
];

export const plans: Plan[] = [
  {
    title: "استاندارد",
    key: "standard",
    shortDescription: "مخصوص مبتدیان و تازه کاران",
    description:
      "مناسب طراحان تازه‌کار و دانشجویانی که می‌خواهند بدون دردسر، دایلاین‌های آماده و دقیق برای پروژه‌های خود بسازند.",
    get fairDownload() {
      return calculateFairDownload({ monthly: 40 });
    },
    price: 399000,
    level: 1,
    features: [
      ...generals,
      ...paids.map((feature) => ({ ...feature, active: false })),
    ],
  },
  {
    title: "حرفه‌ای",
    key: "pro",
    shortDescription: "مخصوص حرفه‌ای ها و متخصص ها",
    description:
      "بهترین انتخاب برای طراحان حرفه‌ای و فریلنسرها؛ دسترسی گسترده‌تر، آزادی عمل بیشتر و سرعت بالاتر در آماده‌سازی دایلاین‌ها.",
    get fairDownload() {
      return calculateFairDownload({ monthly: 100 });
    },
    price: 699000,
    level: 2,
    features: [...generals, ...paids],
  },
  {
    title: "سازمانی",
    key: "organization",
    shortDescription: "مخصوص سازمان ها و تیم ها",
    description:
      "مناسب چاپخانه‌ها و تیم‌های طراحی بزرگ که به تولید نامحدود، دقت صنعتی و جریان کاری پایدار نیاز دارند.",
    get fairDownload() {
      return calculateFairDownload({ monthly: 500 });
    },
    price: 1399000,
    level: 3,
    features: [...generals, ...paids],
  },
];
