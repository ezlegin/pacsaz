import { CustomerForm } from "@/components/forms/CustomerForm";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import CustomersList from "./CustomersList";
import { pagination } from "@repo/lib/utils/pagination";
import { getSessionUser } from "@repo/auth/session";
import { Mail, MapPin, Users } from "lucide-react";
import {
  EmptyState,
  PanelPage,
  PageHeader,
  PanelCard,
  StatTile,
} from "../components/PanelUI";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const user = await getSessionUser();
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const where = { userId: user?.id };

  /* Premium gate — same rule as before, presented properly. */
  if (!user?.plan?.isPremium)
    return (
      <PanelPage>
        <PageHeader
          icon={Users}
          title="مشتری‌ها"
          description="مدیریت مشتریان و نسبت دادن قالب‌های ذخیره‌شده به هر پروژه."
        />

        <PanelCard>
          <EmptyState
            icon={Users}
            title="این بخش مخصوص پلن‌های حرفه‌ای و سازمانی است"
            description="با ارتقای اشتراک می‌توانی مشتری‌ها را ثبت کنی، قالب‌های ذخیره‌شده را به آن‌ها نسبت بدهی و پروژه‌ها را منظم نگه داری."
            action={
              <Link href="/subscription">
                <Button variant="gradient" className="group">
                  مشاهده پلن‌ها
                </Button>
              </Link>
            }
          />
        </PanelCard>
      </PanelPage>
    );

  const [customers, totalCustomers, withEmail, withAddress] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { id: "desc" } }),
    prisma.customer.count({ where }),
    prisma.customer.count({ where: { ...where, email: { not: null } } }),
    prisma.customer.count({ where: { ...where, address: { not: null } } }),
  ]);

  // todo: searching

  return (
    <PanelPage>
      <PageHeader
        icon={Users}
        title="مشتری‌ها"
        description="مدیریت مشتریان و نسبت دادن قالب‌های ذخیره‌شده به هر پروژه."
        actions={
          <PopupNewDialog buttonTitle="مشتری جدید" icon>
            <DialogTitle>مشتری جدید</DialogTitle>
            <CustomerForm type="create" />
          </PopupNewDialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Users}
          label="کل مشتری‌ها"
          value={`${fa(totalCustomers)} مشتری`}
          tone="primary"
        />
        <StatTile
          icon={Mail}
          label="دارای ایمیل"
          value={`${fa(withEmail)} مورد`}
          hint="برای ارسال فایل و صورت‌حساب"
        />
        <StatTile
          icon={MapPin}
          label="دارای آدرس"
          value={`${fa(withAddress)} مورد`}
          hint="آماده ارسال مرسوله"
        />
      </div>

      <div className="flex">
        <Search placeholder="جستجوی مشتری..." className="w-full sm:max-w-xs" />
      </div>

      <CustomersList data={customers} />

      <Pagination
        pageSize={globalPageSize}
        totalItems={totalCustomers}
        lang="fa"
      />
    </PanelPage>
  );
};

export default page;

export const metadata = {
  title: "مشتری ها",
};
