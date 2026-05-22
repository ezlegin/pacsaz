import { getUserPlan } from "@/data/plan";
import { getSessionUser } from "@/data/user";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Calendar, Download, FolderDown, Frown } from "lucide-react";
import Link from "next/link";
import LastDownloads from "./components/LastDownloads";
import RemainingDownloads from "./components/RemainingDownloads";
import UserSubscriptionCard from "./components/UserSubscriptionCard";
import { StatCard } from "@/components/StatCard";
import { formatDate } from "date-fns";

const Page = async () => {
  const user = await getSessionUser();
  const plan = await getUserPlan(user?.id);
  const tarrif = await prisma.tarrif.findMany({ include: { price: true } });

  if (!plan)
    return (
      <Card className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Frown size={50} />
        <span>اشتراک فعالی ندارید.</span>
        <Link href={"/subscription"}>
          <Button size={"lg"}>مشاهده پلن ها</Button>
        </Link>
      </Card>
    );

  const fairDownload = plan.fairDownload;
  const downloaded = plan.downloaded;

  const allDownloads = await prisma.downloadHistory.count({
    where: { userId: user?.id },
  });
  const downloadRecords = await prisma.downloadHistory.findMany({
    where: { userId: user?.id }, // todo
    take: 10,
    include: { dieline: true, settings: true },
    orderBy: { downloadedAt: "desc" },
  });

  return (
    <div className="grid grid-cols-6 gap-5">
      <UserSubscriptionCard plan={plan} tarrif={tarrif} />

      <RemainingDownloads downloaded={downloaded} fairDownload={fairDownload} />

      <StatCard
        title="دانلود این پلن"
        value={`${downloaded} دانلود`}
        icon={Download}
        className="col-span-2"
      />

      <StatCard
        title="تعداد کل دانلودها"
        value={`${allDownloads} دانلود`}
        icon={FolderDown}
        className="col-span-2"
      />

      <StatCard
        title="پایان اشتراک"
        value={formatDate(plan?.endsAt!, "PP")}
        icon={Calendar}
        className="col-span-2"
      />

      <LastDownloads data={downloadRecords} />
    </div>
  );
};

export default Page;
