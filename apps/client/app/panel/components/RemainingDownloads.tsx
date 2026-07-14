import Card from "@repo/ui/components/custom/Card";
import { Progress } from "@repo/ui/components/progress";
import React from "react";

const RemainingDownloads = ({
  downloaded,
  fairDownload,
}: {
  fairDownload: number;
  downloaded: number;
}) => {
  return (
    <Card className="space-y-4 text-sm font-medium text-muted-foreground">
      <div>دانلود مجاز: {fairDownload} عدد</div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>باقی مانده</span>
          <span>{fairDownload - downloaded} دانلود</span>
        </div>
        <Progress value={100 - (downloaded / fairDownload) * 100} />
      </div>
    </Card>
  );
};

export default RemainingDownloads;
