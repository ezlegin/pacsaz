import SubscriptionList from "@/components/SubscriptionList";
import { testUser } from "@/data/user";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { RotateCw, Zap } from "lucide-react";

const page = () => {
  return isSubscribed ? (
    <div className="grid grid-cols-4 gap-5">
      <div className="flex justify-between items-center border border-primary p-5 rounded-2xl col-span-2">
        <div>
          <div className="text-sm text-muted-foreground">پلن</div>
          <div className="font-semibold text-xl">استاندارد</div>
          <div className="text-xs text-muted-foreground">36 روز باقی مانده</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="space-x-1">
            <span className="font-semibold text-xl">
              {(399).toLocaleString("en-US")} تومان
            </span>
            <span className="text-xs text-muted-foreground">/ ماهانه</span>
          </div>

          <Button variant={"primaryForeground"} size={"sm"}>
            <RotateCw />
            تمدید اشتراک
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center border p-5 bg-primary text-primary-foreground rounded-2xl col-span-2">
        <div>
          <div className="text-sm text-muted">پلن</div>
          <div className="font-semibold text-xl">حرفه ای</div>
          <div className="text-xs text-muted">مخصوص حرفه ای ها</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="space-x-1">
            <span className="font-semibold text-xl">
              {(699).toLocaleString("en-US")} تومان
            </span>
            <span className="text-xs text-muted">/ ماهانه</span>
          </div>

          <Button variant={"secondary"} size={"sm"}>
            <Zap />
            ارتقا اشتراک
          </Button>
        </div>
      </div>
      <div className="border p-5 rounded-2xl text-sm font-medium text-muted-foreground space-y-1 col-span-4">
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
      </div>

      {/* <div className="border p-5 rounded-2xl text-sm font-medium text-muted-foreground">
        <div>دانلود این هفته</div>

        <div>
          <span className="text-xl text-foreground font-medium">12 دانلود</span>
        </div>
      </div>

      <div className="border p-5 rounded-2xl text-sm font-medium text-muted-foreground">
        <div>دانلود این ماه</div>

        <div>
          <span className="text-xl text-foreground font-medium">
            {testUser.downloaded} دانلود
          </span>
        </div>
      </div> */}

      {/* <div className="border p-5 rounded-2xl text-sm font-medium text-muted-foreground">
        <div>اتمام اشتراک</div>

        <div>
          <span className="text-xl text-foreground font-medium">
            {formatDate(testUser.subscriptionEndsAt, "PPP")}
          </span>
        </div>
      </div> */}
    </div>
  ) : (
    <div className="border p-10 rounded-2xl bg-accent">
      <SubscriptionList />
    </div>
  );
};

export default page;
