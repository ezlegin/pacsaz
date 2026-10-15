import { ProfileForm } from "@/components/forms/ProfileForm";
import { loginPageRoute } from "@/proxy";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { formatDate } from "date-fns";
import {
  BadgeCheck,
  CalendarDays,
  Flag,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  PanelPage,
  PageHeader,
  PanelCard,
  Pill,
  SectionHeader,
} from "../components/PanelUI";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const USER_TYPE_LABEL: Record<string, string> = {
  student: "دانشجو",
  designer: "طراح",
  designStudio: "استودیو طراحی",
  printHouse: "چاپخانه",
  dielineMaker: "سازنده دایلاین",
  packagingFactory: "کارخانه بسته‌بندی",
  other: "سایر",
};

const GOAL_LABEL: Record<string, string> = {
  practice: "تمرین و یادگیری",
  projects: "پروژه‌های کاری",
  portfolio: "ساخت نمونه‌کار",
  hobby: "سرگرمی",
  other: "سایر",
};

const ProfilePage = async () => {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser?.id } });

  if (!user) redirect(loginPageRoute);

  /** `getSessionUser` is the only place that resolves the active plan. */
  const activePlan = sessionUser?.plan ?? null;

  const [downloads, favs, saved, plans] = await Promise.all([
    prisma.downloadHistory.count({ where: { userId: user.id } }),
    prisma.favedDieline.count({ where: { userId: user.id } }),
    prisma.savedDieline.count({ where: { userId: user.id } }),
    prisma.plan.count({ where: { userId: user.id } }),
  ]);

  const identity = [
    {
      icon: Phone,
      label: "شماره تماس",
      value: user.phoneNumber,
      ltr: true,
    },
    { icon: Mail, label: "ایمیل", value: user.email, ltr: true },
    {
      icon: UserRound,
      label: "نوع کاربری",
      value: user.userType ? USER_TYPE_LABEL[user.userType] : "—",
    },
    {
      icon: Flag,
      label: "هدف استفاده",
      value: user.usageGoal ? GOAL_LABEL[user.usageGoal] : "—",
    },
  ];

  const activity = [
    { label: "دانلودها", value: downloads },
    { label: "علاقه‌مندی‌ها", value: favs },
    { label: "ذخیره‌شده‌ها", value: saved },
    { label: "اشتراک‌ها", value: plans },
  ];

  return (
    <PanelPage className="mx-auto w-full max-w-4xl">
      <PageHeader
        icon={UserRound}
        title="مشخصات کاربری"
        description="نام نمایشی و نوع کاربری‌ات را اینجا ویرایش کن. شماره تماس و ایمیل قابل تغییر نیستند."
      />

      {/* ------------------------------ identity ---------------------------- */}
      <PanelCard accent>
        <div className="relative overflow-hidden border-b bg-gradient-to-bl from-primary/[0.07] to-transparent p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-20 size-48 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl font-extrabold text-white shadow-lg shadow-primary/25">
              {user.fullName.trim().charAt(0)}
            </span>

            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="truncate text-lg font-extrabold tracking-tight">
                {user.fullName}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {activePlan ? (
                  <Pill tone="primary">
                    <Flag className="size-3" />
                    پلن {activePlan.title}
                  </Pill>
                ) : (
                  <Pill tone="muted">بدون اشتراک فعال</Pill>
                )}

                {user.onboardingCompleted && (
                  <Pill tone="success">
                    <BadgeCheck className="size-3" />
                    تکمیل پروفایل
                  </Pill>
                )}

                <Pill tone="outline">
                  <CalendarDays className="size-3" />
                  عضویت از {formatDate(user.joinedAt, "yyyy/MM/dd")}
                </Pill>
              </div>
            </div>
          </div>
        </div>

        {/* activity counters */}
        <div className="grid grid-cols-2 divide-y sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-x-reverse">
          {activity.map((item) => (
            <div key={item.label} className="space-y-1 p-5 text-center">
              <p className="text-xl font-extrabold text-primary">
                {fa(item.value)}
              </p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ------------------------------ edit ----------------------------- */}
        <PanelCard>
          <SectionHeader
            icon={UserRound}
            title="ویرایش مشخصات"
            description="نام و نوع کاربری"
          />
          <div className="p-5">
            <ProfileForm user={user} />
          </div>
        </PanelCard>

        {/* ---------------------------- read only -------------------------- */}
        <PanelCard>
          <SectionHeader
            icon={ShieldCheck}
            title="اطلاعات حساب"
            description="این موارد توسط سیستم مدیریت می‌شوند"
          />

          <ul className="divide-y">
            {identity.map(({ icon: Icon, label, value, ltr }) => (
              <li key={label} className="flex items-center gap-3 px-5 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
                <span
                  dir={ltr ? "ltr" : undefined}
                  className="mr-auto truncate text-xs font-bold"
                >
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </PanelPage>
  );
};

export default ProfilePage;

export const metadata = {
  title: "مشخصات",
};
