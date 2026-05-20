import { deleteSavedDieline } from "@/actions/dieline";
import DeleteButton from "@/components/DeleteButton";
import SaveDielineForm from "@/components/forms/SaveDielineForm";
import { CustomDielineSettings, Dieline, Plan, SavedDieline } from "@repo/db";
import ActionButton, {
  ActButton,
} from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { formatDate } from "date-fns";
import { Pencil, RotateCw } from "lucide-react";
import Link from "next/link";

interface SavedDielineType extends SavedDieline {
  settings: CustomDielineSettings | null;
  dieline: Dieline;
}

const SavedDielinesList = ({
  data,
  plan,
}: {
  data: SavedDielineType[];
  plan: Plan;
}) => {
  const renderRows = (data: SavedDielineType) => {
    const { createdAt, id, title, description, settings, dieline } = data;

    return (
      <TableRow key={id}>
        <TableCell>
          <Tooltip>
            <TooltipTrigger>{title}</TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">{dieline?.title}</TableCell>
        <TableCell className="text-center">
          W{settings?.width} - L{settings?.length} - H{settings?.height}
        </TableCell>
        <TableCell className="text-center">{settings?.material}</TableCell>
        <TableCell className="text-center">{settings?.thickness}</TableCell>
        <TableCell className="text-center">{settings?.bleed}</TableCell>
        <TableCell className="text-center">{settings?.dimensionType}</TableCell>
        <TableCell className="text-center">
          {formatDate(createdAt, "PP")}
        </TableCell>
        <TableCell className="flex justify-center">
          <Link
            target="_blank"
            href={`/dieline/${dieline?.slug}?settingsId=${settings?.id}`}
          >
            <ActButton>
              <RotateCw size={14} />
            </ActButton>
          </Link>
        </TableCell>
        <TableCell className="text-left">
          <ActionButton icon={Pencil}>
            <DialogTitle>ویرایش قالب</DialogTitle>
            <SaveDielineForm
              plan={plan}
              settings={settings!}
              slug={dieline?.slug}
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
      <Table
        columns={columns}
        data={data}
        renderRows={renderRows}
        noDataMessage="هیچ قالبی ذخیره نکرده اید..."
      />
    </Card>
  );
};

export default SavedDielinesList;

const columns = [
  { label: "عنوان" },
  { label: "قالب" },
  { label: "ابعاد (mm)" },
  { label: "متریال" },
  { label: "ضخامت (mm)" },
  { label: "بلید (mm)" },
  { label: "نوع ابعاد" },
  { label: "تاریخ" },
  { label: "باز تولید" },
  { label: "ویرایش" },
];
