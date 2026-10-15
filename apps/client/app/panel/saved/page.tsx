import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import SavedDielinesList from "./SavedDielinesList";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { Bookmark, Download, Layers, Sparkles } from "lucide-react";
import {
  EmptyState,
  PanelPage,
  PageHeader,
  PanelCard,
  StatTile,
} from "../components/PanelUI";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ page: string }>;
}

const SavedPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, PAGE_SIZE);

  const user = await getSessionUser();

  /* Premium gate — same rule as before, presented properly. */
  if (!user?.plan?.isPremium)
    return (
      <PanelPage>
        <PageHeader
          icon={Bookmark}
          title="ذخیره‌شده‌ها"
          description="نسخه‌های شخصی‌سازی‌شده‌ی قالب‌ها را ذخیره کن و بعداً با یک کلیک بازتولید کن."
        />

        <PanelCard>
          <EmptyState
            icon={Sparkles}
            title="این بخش مخصوص پلن‌های حرفه‌ای و سازمانی است"
            description="با ارتقای اشتراک می‌توانی ابعاد، متریال و بلید هر قالب را ذخیره کنی و بی‌نهایت نسخه‌ی شخصی داشته باشی."
            action={
              <Link href="/subscription">
                <Button variant="gradient">مشاهده پلن‌ها</Button>
              </Link>
            }
          />
        </PanelCard>
      </PanelPage>
    );

  const where = { userId: user.id };

  const [savedDielines, totalSaved] = await Promise.all([
    prisma.savedDieline.findMany({
      where,
      include: { settings: true, dieline: true },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.savedDieline.count({ where }),
  ]);

  // todo: searching

  return (
    <PanelPage>
      <PageHeader
        icon={Bookmark}
        title="ذخیره‌شده‌ها"
        description="نسخه‌های شخصی‌سازی‌شده‌ی قالب‌ها با ابعاد و متریال خودت."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Bookmark}
          label="قالب‌های ذخیره‌شده"
          value={`${fa(totalSaved)} مورد`}
          tone="primary"
        />
        <StatTile
          icon={Layers}
          label="پلن فعال"
          value={user.plan.title}
          hint="امکان ذخیره‌سازی نامحدود"
        />
        <StatTile
          icon={Download}
          label="سهمیه این پلن"
          value={`${fa(user.plan.fairDownload)} قالب`}
          hint={`${fa(user.plan.downloaded)} مورد مصرف شده`}
        />
      </div>

      <Search
        placeholder="جستجوی قالب ذخیره‌شده..."
        className="w-full sm:max-w-xs"
      />

      <SavedDielinesList data={savedDielines} plan={user.plan} />

      <Pagination pageSize={PAGE_SIZE} totalItems={totalSaved} lang="fa" />
    </PanelPage>
  );
};

export default SavedPage;

export const metadata = {
  title: "ذخیره شده",
};
