import { StatCard } from "@/components/StatCard";
import SubscriptionList from "@/components/SubscriptionList";
import { getSessionUser } from "@/data/user";
import { prisma } from "@repo/db";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown } from "lucide-react";
import LastDownloads from "./components/LastDownloads";
import RemainingDownloads from "./components/RemainingDownloads";
import UserSubscriptionCard from "./components/UserSubscriptionCard";

const Page = async () => {
  const user = await getSessionUser();
  const userPlan = user?.plan;

  if (!userPlan) return <SubscriptionList />;

  const fairDownload = userPlan.fairDownload;
  const downloaded = userPlan.downloaded;

  const downloadRecords = await prisma.downloadHistory.findMany({
    where: { userId: 1 }, // todo
    take: 10,
    include: { dieline: true, settings: true },
    orderBy: { downloadedAt: "desc" },
  });

  return (
    <div className="grid grid-cols-6 gap-5">
      <UserSubscriptionCard userPlan={userPlan} />

      <RemainingDownloads downloaded={downloaded} fairDownload={fairDownload} />

      <StatCard
        title="دانلود این ماه"
        value={`${downloaded} دانلود`}
        icon={Download}
        className="col-span-2"
      />

      <StatCard
        title="تعداد کل دانلودها"
        value="129 دانلود"
        icon={FolderDown}
        className="col-span-2"
      />

      <StatCard
        title="پایان اشتراک"
        value={formatDate(user?.plan?.endsAt!, "P")}
        icon={Calendar}
        className="col-span-2"
      />

      <LastDownloads data={downloadRecords} />
    </div>
  );
};

export default Page;
