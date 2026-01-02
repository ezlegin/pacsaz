import { testUser } from "@/data/user";
import { Progress } from "@workspace/ui/components/progress";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown } from "lucide-react";
import Card from "./Card";
import { StatCard } from "./StatCard";
import UserSubscriptionCard from "./UserSubscriptionCard";

const PanelDashboard = () => {
  return (
    <div className="grid grid-cols-6 gap-5">
      <UserSubscriptionCard />

      <Card className="col-span-3 space-y-4 text-sm font-medium text-muted-foreground">
        <div>دانلود باقی مانده</div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>{testUser.fairDownload} دانلود</span>
            <span>{testUser.fairDownload - testUser.downloaded} دانلود</span>
          </div>
          <Progress
            value={100 - (testUser.downloaded / testUser.fairDownload) * 100}
          />
        </div>
      </Card>

      <StatCard
        title="دانلود این ماه"
        value={`${testUser.downloaded} دانلود`}
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
        value={formatDate(testUser.subscriptionEndsAt, "PPP")}
        icon={Calendar}
        className="col-span-2"
      />
    </div>
  );
};

export default PanelDashboard;
