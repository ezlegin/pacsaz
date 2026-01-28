import SaveDielineForm from "@/components/forms/SaveDielineForm";
import { DimensionType, MaterialKey } from "@repo/store/data/types";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Pencil } from "lucide-react";

export type SavedDielines = {
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

const SavedDielinesList = ({ data }: { data: SavedDielines[] }) => {
  const renderRows = (data: SavedDielines) => {
    const {
      bleed,
      dimensions,
      dimenstionsType,
      dieline,
      id,
      material,
      thickness,
      title,
      downloadedAt,
    } = data;
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
          <Dialog>
            <DialogTrigger asChild>
              <ActionButton icon={Pencil} />
            </DialogTrigger>
            <DialogContent asChild>
              <SaveDielineForm type="update" />
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card title="قالب‌های ذخیره شده" className="col-span-6">
      <Table columns={columns} data={data} renderRows={renderRows} />
    </Card>
  );
};

export default SavedDielinesList;

const columns = [
  { label: "عنوان" },
  { label: "قالب" },
  { label: "ابعاد" },
  { label: "متریال" },
  { label: "ضخامت" },
  { label: "بلید" },
  { label: "نوع ابعاد" },
  { label: "تاریخ" },
  { label: "ویرایش" },
];
