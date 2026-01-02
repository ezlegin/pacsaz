import Card from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import SubscriptionList from "@/components/SubscriptionList";
import { mapUserPlan, PlanType, testUser } from "@/data/user";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown, Zap } from "lucide-react";

const Page = () => {
  if (!isSubscribed) {
    return (
      <Card>
        <SubscriptionList />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-5">
      <Card className="flex justify-between items-center col-span-3 bg-primary-foreground border-primary">
        <div>
          <div className="text-sm text-muted-foreground">پلن</div>
          <div className="text-2xl font-semibold">
            {mapUserPlan(testUser.plan as PlanType)}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            36 روز باقی مانده
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">کافی نیست؟</span>

          <Button variant="gradient">
            <Zap />
            ارتفا اشتراک
          </Button>
        </div>
      </Card>

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

export default Page;
