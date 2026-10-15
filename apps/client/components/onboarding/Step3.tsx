import { OnboardingFormType } from "@/lib/validatoinSchema";
import { UsageGoal } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import {
  Briefcase,
  Check,
  Compass,
  GraduationCap,
  Image as ImageIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";

const Step3 = ({
  form,
}: {
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
}) => {
  const selected = form.watch("usageGoal");

  return (
    <div className="space-y-5">
      <header className="space-y-1.5 text-center">
        <h2 className="text-lg font-extrabold tracking-tight">
          هدف شما از استفاده از پک‌ساز چیست؟
        </h2>
        <p className="text-xs text-muted-foreground">
          این انتخاب به ما کمک می‌کند قالب‌ها و راهنماهای مرتبط‌تری پیشنهاد بدهیم.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {usageGoals.map(({ title, key, description, icon: Icon }) => {
          const active = selected === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                form.setValue("usageGoal", key, { shouldValidate: true })
              }
              aria-pressed={active}
              className={cn(
                "group relative flex items-start gap-3 rounded-2xl border p-4 text-right transition-all duration-300",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                active
                  ? "border-primary bg-primary/[0.06] shadow-md shadow-primary/10"
                  : "bg-background hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300",
                  active
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-primary/25"
                    : "bg-primary/10 text-primary group-hover:bg-primary/15",
                )}
              >
                <Icon className="size-4.5" strokeWidth={1.8} />
              </span>

              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block text-xs font-bold">{title}</span>
                <span className="block text-[10px] leading-5 text-muted-foreground">
                  {description}
                </span>
              </span>

              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-all duration-300",
                  active ? "border-primary bg-primary" : "border-border",
                )}
              >
                {active && <Check className="size-2.5" strokeWidth={4} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step3;

const usageGoals: {
  title: string;
  key: UsageGoal;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "پروژه‌های واقعی",
    key: "projects",
    description: "طراحی برای مشتری یا تولید واقعی",
    icon: Briefcase,
  },
  {
    title: "تمرین و یادگیری",
    key: "practice",
    description: "آشنایی با اصول دایلاین و بسته‌بندی",
    icon: GraduationCap,
  },
  {
    title: "نمونه کار (Portfolio)",
    key: "portfolio",
    description: "ساخت نمونه‌کار برای نمایش توانمندی",
    icon: ImageIcon,
  },
  {
    title: "سرگرمی",
    key: "hobby",
    description: "کنجکاوی و پروژه‌های شخصی",
    icon: Compass,
  },
  {
    title: "سایر",
    key: "other",
    description: "هدف متفاوت از موارد بالا",
    icon: Sparkles,
  },
];
