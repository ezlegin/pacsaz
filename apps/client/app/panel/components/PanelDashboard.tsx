import LastDownloads from "@/app/panel/components/LastDownloads";
import { sessionUser } from "@repo/store/app/user.store";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown } from "lucide-react";
import { StatCard } from "../../../components/StatCard";
import RemainingDownloads from "./RemainingDownloads";
import UserSubscriptionCard from "./UserSubscriptionCard";

const PanelDashboard = () => {
  const fairDownload = sessionUser?.plan?.downloads.fair;
  const downloaded = sessionUser?.plan?.downloads.downloaded;

  if (!fairDownload || !downloaded)
    throw new Error("User or User Plan not Provided. [PanelDashboard]");

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

      <LastDownloads data={data} />
    </div>
  );
};

export default PanelDashboard;

const data: LastDownloads[] = [
  {
    id: 1,
    bleed: 5,
    dimensions: "90x160x50 mm",
    dieline: "tuck-end",
    material: "b-flute",
    thickness: 3,
    downloadedAt: new Date(),
  },
  {
    id: 2,
    bleed: 5,
    dimensions: "90x160 mm",
    dieline: "postal-card",
    material: "f-flute",
    thickness: 1.2,
    downloadedAt: new Date(),
  },
  {
    id: 3,
    bleed: 5,
    dimensions: "90x160x50 mm",
    dieline: "tuck-end",
    material: "b-flute",
    thickness: 3,
    downloadedAt: new Date(),
  },
];
