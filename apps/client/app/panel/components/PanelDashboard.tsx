import LastDownloads from "@/app/panel/components/LastDownloads";
import { sessionUser } from "@repo/store/app/user.store";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown } from "lucide-react";
import { StatCard } from "../../../components/StatCard";
import RemainingDownloads from "./RemainingDownloads";
import UserSubscriptionCard from "./UserSubscriptionCard";
import { prisma } from "@repo/db";

const PanelDashboard = async () => {
  const fairDownload = sessionUser?.plan?.downloads.fair;
  const downloaded = sessionUser?.plan?.downloads.downloaded;

  if (!fairDownload || !downloaded)
    throw new Error("User or User Plan not Provided. [PanelDashboard]");

  const downloadRecords = await prisma.downloadHistory.findMany({
    where: { userId: 1 }, // todo
    take: 10,
    include: { dieline: true, settings: true },
    orderBy: { downloadedAt: "desc" },
  });

  return (
    <div className="grid grid-cols-6 gap-5">
      <UserSubscriptionCard />

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
        value={formatDate(sessionUser?.plan?.endsAt!, "P")}
        icon={Calendar}
        className="col-span-2"
      />

      <LastDownloads data={downloadRecords} />
    </div>
  );
};

export default PanelDashboard;
