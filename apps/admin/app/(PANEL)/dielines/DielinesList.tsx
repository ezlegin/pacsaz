import { deleteDieline } from "@/actions/dieline";
import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import DeleteButton from "@/components/DeleteButton";
import { mainURL } from "@/data/envs";
import {
  Dieline,
  DielineCategoryByModel,
  DielineCategoryByUsage,
} from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight, Pencil, Settings } from "lucide-react";

export interface DielineType extends Dieline {
  categoryByUsage: DielineCategoryByUsage[];
  categoryByModel: DielineCategoryByModel[];
  _count: { downloadHistory: number };
}

export type Categories = {
  byModel: DielineCategoryByModel[];
  byUsage: DielineCategoryByUsage[];
};

const DielinesList = ({
  data,
  categories,
}: {
  data: DielineType[];
  categories: Categories;
}) => {
  const renderRows = (dieline: DielineType) => {
    return (
      <TableRow key={dieline.id}>
        <TableCell>{dieline.id}</TableCell>
        <TableCell className="text-center">
          <a
            target="_blank"
            href={`${mainURL}/dieline/${dieline.slug}`}
            className="flex gap-1 w-full justify-center items-center"
          >
            {dieline.title}
            <ArrowUpRight size={11} />
          </a>
        </TableCell>
        <TableCell className="text-center">{dieline.slug}</TableCell>
        <TableCell className="text-center flex gap-2 justify-center items-center">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"outline"}>By Usage</Badge>
            </TooltipTrigger>
            <TooltipContent dir="rtl">
              {dieline.categoryByUsage.map((i) => (
                <div key={i.id}>- {i.title}</div>
              ))}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"outline"}>By Model</Badge>
            </TooltipTrigger>
            <TooltipContent dir="rtl">
              {dieline.categoryByModel.map((i) => (
                <div key={i.id}>- {i.title}</div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">
          {dieline._count.downloadHistory}
        </TableCell>
        <TableCell className="flex justify-center">
          <div
            className={cn(
              dieline.active
                ? "bg-green-500 drop-shadow-green-500"
                : "bg-gray-300",
              "w-5 h-1.5 rounded-full drop-shadow-sm",
            )}
          />
        </TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            <ActionButton icon={Settings}>
              <DielineSettingsForm dieline={dieline} categories={categories} />
            </ActionButton>
            <ActionButton
              icon={Pencil}
              href={`/editor/${dieline.slug}`}
              target="_blank"
            />
            <DeleteButton id={dieline.id} deleteFn={deleteDieline} />
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" />
    </Card>
  );
};

export default DielinesList;

const columns = [
  { label: "ID", className: "" },
  { label: "Title", className: "" },
  { label: "Slug", className: "" },
  { label: "Categories", className: "" },
  { label: "Downloaded", className: "" },
  { label: "Active", className: "" },
  { label: "Action", className: "" },
];
