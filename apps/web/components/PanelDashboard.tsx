import { testUser } from "@/data/user";
import { MaterialKey } from "@repo/dieline-core/data/consts";
import { Progress } from "@repo/ui/components/progress";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Calendar, Download, FolderDown } from "lucide-react";
import Card from "@repo/ui/components/custom/Card";
import { StatCard } from "./StatCard";
import UserSubscriptionCard from "./UserSubscriptionCard";
import Table from "@repo/ui/components/custom/Table";

type LastDownloads = {
  id: number;
  dieline: string;
  dimensions: string;
  bleed: number;
  material: MaterialKey;
  thickness: number;
  downloadedAt: Date;
};

const PanelDashboard = () => {
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

  const renderRows = ({
    bleed,
    dimensions,
    dieline,
    id,
    material,
    thickness,
    downloadedAt,
  }: LastDownloads) => {
    return (
      <TableRow key={id}>
        <TableCell>{dieline}</TableCell>
        <TableCell className="text-center">{dimensions}</TableCell>
        <TableCell className="text-center">{material}</TableCell>
        <TableCell className="text-center" dir="ltr">
          {thickness} mm
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {bleed} mm
        </TableCell>
        <TableCell className="text-left">
          {formatDate(downloadedAt, "PP")}
        </TableCell>
      </TableRow>
    );
  };
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
        value={formatDate(testUser.subscriptionEndsAt, "P")}
        icon={Calendar}
        className="col-span-2"
      />

      <Card title="آخرین دانلود‌ها" className="col-span-6">
        <Table
          columns={columns}
          data={data}
          renderRows={renderRows}
          noDataMessage="هنوز هیچ قالبی تولید و دانلود نکرده اید."
        />
      </Card>
    </div>
  );
};

export default PanelDashboard;

const columns = [
  { label: "قالب", className: "" },
  { label: "ابعاد", className: "" },
  { label: "متریال", className: "" },
  { label: "ضخامت", className: "" },
  { label: "بلید", className: "" },
  { label: "تاریخ", className: "" },
];
