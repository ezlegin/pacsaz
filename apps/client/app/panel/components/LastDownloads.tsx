import { MaterialKey } from "@repo/store/data/types";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";

type LastDownloads = {
  id: number;
  dieline: string;
  dimensions: string;
  bleed: number;
  material: MaterialKey;
  thickness: number;
  downloadedAt: Date;
};

const LastDownloads = ({ data }: { data: LastDownloads[] }) => {
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
  { label: "تاریخ", className: "" },
];
