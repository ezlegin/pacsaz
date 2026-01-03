export type PlanKey = "standard" | "pro" | "organization";
export type PlanTitle = "استاندارد" | "حرفه‌ای" | "سازمانی";
export type PlanFeature = { active: boolean; value: string };
export type PlanPrice = {
  monthly: number;
  monthlyOnAnnual: number;
  annual: number;
};
export type PlanLevel = 1 | 2 | 3;

export interface SubCardProps {
  title: PlanTitle;
  price: PlanPrice;
  description: string;
  key: PlanKey;
  shortDescription: string;
  level: 1 | 2 | 3;
  fairDownload: {
    monthly: number;
    annual: number;
  };
  features: PlanFeature[];
}

export const generals = [
  { active: true, value: "دسترسی به تمام قالب ها" },
  { active: true, value: "ذخیره نامحدود قالب ها" },
  { active: true, value: "دانلود فرمت دلخواه" },
  { active: true, value: "انتخاب متریال چاپ" },
  { active: true, value: "انتخاب نوع ابعاد" },
  { active: true, value: "دریافت فایل بدون واترمارک" },
];
export const plans: SubCardProps[] = [
  {
    title: "استاندارد",
    key: "standard",
    shortDescription: "مخصوص مبتدیان و تازه کاران",
    description:
      "مناسب طراحان تازه‌کار و دانشجویانی که می‌خواهند بدون دردسر، دایلاین‌های آماده و دقیق برای پروژه‌های خود بسازند.",
    fairDownload: {
      monthly: 45,
      get annual() {
        return this.monthly * 12;
      },
    },
    price: {
      monthly: 399000,
      monthlyOnAnnual: 279000,
      annual: 3348000,
    },
    level: 1,
    features: [
      ...generals,
      { active: false, value: "تنظیم ضخامت سفارشی متریال" },
      { active: false, value: "انتخاب میزان بلید" },
      { active: false, value: "مشاهده ابعاد کامل دایلاین" },
      { active: false, value: "هشدار خطای برش در ابعاد غیر متعارف" },
      { active: false, value: "امکان ذخیره قالب با نام دلخواه و استفاده مجدد" },
    ],
  },
  {
    title: "حرفه‌ای",
    key: "pro",
    shortDescription: "مخصوص حرفه‌ای ها و متخصص ها",
    description:
      "بهترین انتخاب برای طراحان حرفه‌ای و فریلنسرها؛ دسترسی گسترده‌تر، آزادی عمل بیشتر و سرعت بالاتر در آماده‌سازی دایلاین‌ها.",
    fairDownload: {
      monthly: 100,
      get annual() {
        return this.monthly * 12;
      },
    },
    price: {
      monthly: 699000,
      monthlyOnAnnual: 489000,
      annual: 5868000,
    },
    level: 2,
    features: [
      ...generals,
      { active: true, value: "تنظیم ضخامت سفارشی متریال" },
      { active: true, value: "انتخاب میزان بلید" },
      { active: true, value: "مشاهده ابعاد کامل دایلاین" },
      { active: true, value: "هشدار خطای برش در ابعاد غیر متعارف" },
      { active: true, value: "امکان ذخیره قالب با نام دلخواه و استفاده مجدد" },
    ],
  },
  {
    title: "سازمانی",
    key: "organization",
    shortDescription: "مخصوص سازمان ها و تیم ها",
    description:
      "مناسب چاپخانه‌ها و تیم‌های طراحی بزرگ که به تولید نامحدود، دقت صنعتی و جریان کاری پایدار نیاز دارند.",
    fairDownload: {
      monthly: 300,
      get annual() {
        return this.monthly * 12;
      },
    },
    price: {
      monthly: 1399000,
      monthlyOnAnnual: 979000,
      annual: 11748000,
    },
    level: 3,
    features: [
      ...generals,
      { active: true, value: "تنظیم ضخامت سفارشی متریال" },
      { active: true, value: "انتخاب میزان بلید" },
      { active: true, value: "مشاهده ابعاد کامل دایلاین" },
      { active: true, value: "هشدار خطای برش در ابعاد غیر متعارف" },
      { active: true, value: "امکان ذخیره قالب با نام دلخواه و استفاده مجدد" },
    ],
  },
];
