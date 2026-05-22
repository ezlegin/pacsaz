import { CustomDielineSettings, Dieline, DownloadHistory } from "@repo/db";
import { ActButton } from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { ArrowUpRight, RotateCw } from "lucide-react";
import Link from "next/link";

interface RecordType extends DownloadHistory {
  dieline: Dieline;
  settings: CustomDielineSettings | null;
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
          {settings?.thickness}
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {settings?.bleed}
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {settings?.dimensionType}
        </TableCell>
        <TableCell className="text-center">
          {formatDate(downloadedAt, "PP")}
        </TableCell>
        <TableCell className="flex justify-end">
          <Link
            target="_blank"
            href={`/dieline/${dieline?.slug}?settingsId=${settings?.id}`}
          >
            <ActButton>
              <RotateCw size={14} />
            </ActButton>
          </Link>
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
  { label: "ضخامت (mm)", className: "" },
  { label: "بلید (mm)", className: "" },
  { label: "نوع ابعاد", className: "" },
  { label: "تاریخ", className: "" },
  { label: "باز تولید", className: "" },
];
