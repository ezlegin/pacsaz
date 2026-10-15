import { OnboardingFormType } from "@/lib/validatoinSchema";
import { UserType } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import {
  Briefcase,
  Building2,
  Check,
  Factory,
  GraduationCap,
  Package,
  PenTool,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
}

export const userTypes: {
  title: string;
  key: UserType;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "طراح گرافیک",
    key: "designer",
    description: "طراحی بسته‌بندی برای پروژه‌های مشتریان",
    icon: PenTool,
  },
  {
    title: "استودیو طراحی",
    key: "designStudio",
    description: "تیم طراحی با چند عضو و پروژه",
    icon: Building2,
  },
  {
    title: "دانشجو/دانش‌آموز",
    key: "student",
    description: "یادگیری و تمرین طراحی بسته‌بندی",
    icon: GraduationCap,
  },
  {
    title: "چاپخانه",
    key: "printHouse",
    description: "چاپ و تولید بسته‌بندی سفارشی",
    icon: Factory,
  },
  {
    title: "قالب سازی",
    key: "dielineMaker",
    description: "ساخت قالب و دایلاین صنعتی",
    icon: Ruler,
  },
  {
    title: "تولیدی بسته بندی",
    key: "packagingFactory",
    description: "تولید انبوه محصولات بسته‌بندی",
    icon: Package,
  },
  {
    title: "سایر",
    key: "other",
    description: "کاربری متفاوت از موارد بالا",
    icon: Briefcase,
  },
];

const Step1 = ({ form }: Props) => {
  const selected = form.watch("userType");

  return (
    <div className="space-y-5">
      <header className="space-y-1.5 text-center">
        <h2 className="text-lg font-extrabold tracking-tight">
          کدام گزینه شما را بهتر توصیف می‌کند؟
        </h2>
        <p className="text-xs text-muted-foreground">
          بر اساس انتخاب شما، پیشنهادها و قالب‌های مناسب‌تری نمایش داده می‌شود.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {userTypes.map(({ title, key, description, icon: Icon }) => {
          const active = selected === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                form.setValue("userType", key, { shouldValidate: true })
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

export default Step1;
