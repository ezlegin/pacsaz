import Card from "@/components/Card";
import Table from "@/components/Table";
import { MaterialKey } from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { Button } from "@repo/ui/components/button";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Pencil } from "lucide-react";

type LastDownloads = {
  id: number;
  title: string;
  dieline: string;
  dimensions: string;
  bleed: number;
  material: MaterialKey;
  thickness: number;
  dimenstionsType: DimensionType;
  downloadedAt: Date;
};

const page = () => {
  const data: LastDownloads[] = [
    {
      id: 1,
      bleed: 5,
      dimensions: "90x160x50 mm",
      dieline: "tuck-end",
      dimenstionsType: "manufacture",
      material: "b-flute",
      thickness: 3,
      title: "آقای رحیمی",
      downloadedAt: new Date(),
    },
    {
      id: 2,
      bleed: 3,
      dimensions: "90x160 mm",
      dieline: "postal-card",
      dimenstionsType: "manufacture",
      material: "f-flute",
      thickness: 1.2,
      title: "شرکت پک ساز",
      downloadedAt: new Date(),
    },
  ];

  const renderRows = ({
    bleed,
    dimensions,
    dimenstionsType,
    dieline,
    id,
    material,
    thickness,
    title,
    downloadedAt,
  }: LastDownloads) => {
    return (
      <TableRow key={id}>
        <TableCell>{title}</TableCell>
        <TableCell className="text-center">{dieline}</TableCell>
        <TableCell className="text-center">{dimensions}</TableCell>
        <TableCell className="text-center">{material}</TableCell>
        <TableCell className="text-center">{thickness}</TableCell>
        <TableCell className="text-center">{bleed}</TableCell>
        <TableCell className="text-center">{dimenstionsType}</TableCell>
        <TableCell className="text-center">
          {formatDate(downloadedAt, "PP")}
        </TableCell>
        <TableCell className="text-left">
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full size-8"
          >
            <Pencil className="scale-90" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card title="قالب‌های ذخیره شده" className="col-span-6">
      <Table
        columns={columns}
        data={data}
        renderRows={renderRows}
        noDataMessage=""
      />
    </Card>
  );
};

export default page;

const columns = [
  { label: "عنوان", className: "" },
  { label: "قالب", className: "" },
  { label: "ابعاد", className: "" },
  { label: "متریال", className: "" },
  { label: "ضخامت", className: "" },
  { label: "بلید", className: "" },
  { label: "نوع ابعاد", className: "" },
  { label: "تاریخ", className: "" },
  { label: "ویرایش", className: "" },
];
