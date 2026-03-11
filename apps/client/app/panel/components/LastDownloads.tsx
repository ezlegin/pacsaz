import { Dieline, DownloadHistory, Settings } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { ArrowUpRight } from "lucide-react";

interface RecordType extends DownloadHistory {
  dieline: Dieline;
  settings: Settings | null;
}

const LastDownloads = ({ data }: { data: RecordType[] }) => {
  const renderRows = ({ id, downloadedAt, dieline, settings }: RecordType) => {
    return (
      <TableRow key={id}>
        <TableCell>
          <a
            href={`/dieline/${dieline.slug}`}
            className="flex gap-0.5 items-center"
          >
            <ArrowUpRight size={11} />
            {dieline.title}
          </a>
        </TableCell>
        <TableCell className="text-center">{`${settings?.length}x${settings?.width}x${settings?.height}mm`}</TableCell>
        <TableCell className="text-center">{settings?.material}</TableCell>
        <TableCell className="text-center" dir="ltr">
          {settings?.thickness} mm
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {settings?.bleed} mm
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {settings?.dimensionType}
        </TableCell>
        <TableCell className="text-left">
          {formatDate(downloadedAt, "PP")}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card title="آخرین دانلود‌ها" className="col-span-6">
      <Table
        columns={columns}
        data={data}
        renderRows={renderRows}
        noDataMessage="هنوز هیچ قالبی تولید و دانلود نکرده اید."
      />
    </Card>
  );
};

export default LastDownloads;

const columns = [
  { label: "قالب", className: "" },
  { label: "ابعاد", className: "" },
  { label: "متریال", className: "" },
  { label: "ضخامت", className: "" },
  { label: "بلید", className: "" },
  { label: "نوع ابعاد", className: "" },
  { label: "تاریخ", className: "" },
];
