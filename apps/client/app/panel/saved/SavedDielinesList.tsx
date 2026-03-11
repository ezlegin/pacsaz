import { deleteSavedDieline } from "@/actions/dieline";
import DeleteButton from "@/components/DeleteButton";
import SaveDielineForm from "@/components/forms/SaveDielineForm";
import { Dieline, SavedDieline, Settings } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Pencil } from "lucide-react";

interface SavedDielineType extends SavedDieline {
  settings: Settings | null;
  dieline: Dieline;
}

const SavedDielinesList = ({ data }: { data: SavedDielineType[] }) => {
  const renderRows = (data: SavedDielineType) => {
    const { createdAt, id, title, settings, dieline } = data;

    return (
      <TableRow key={id}>
        <TableCell>{title}</TableCell>
        <TableCell className="text-center">{dieline.title}</TableCell>
        <TableCell className="text-center">{settings?.width}</TableCell>
        <TableCell className="text-center">{settings?.material}</TableCell>
        <TableCell className="text-center">{settings?.thickness}mm</TableCell>
        <TableCell className="text-center">{settings?.bleed}mm</TableCell>
        <TableCell className="text-center">{settings?.dimensionType}</TableCell>
        <TableCell className="text-center">
          {formatDate(createdAt, "PP")}
        </TableCell>
        <TableCell className="text-left space-x-1.5">
          <ActionButton icon={Pencil}>
            <DialogTitle>ویرایش قالب</DialogTitle>
            <SaveDielineForm
              settings={settings!}
              slug={dieline.slug}
              savedDieline={data}
            />
          </ActionButton>
          <DeleteButton deleteFn={deleteSavedDieline} id={data.id} />
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
