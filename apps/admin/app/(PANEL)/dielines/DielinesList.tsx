import { deleteDieline } from "@/actions/dieline";
import DeleteButton from "@/components/DeleteButton";
import DielineStatusSetter from "@/components/DielineStatusSetter";
import DuplicateButton from "@/components/DuplicateButton";
import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import { mainURL } from "@/data/envs";
import { placeholder } from "@/public";
import {
  Dieline,
  DielineCategoryByModel,
  DielineCategoryByUsage,
  DielineImage,
  DielineSettings,
  ModelImage,
} from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { ArrowUpRight, Pencil, Settings } from "lucide-react";
import Image from "next/image";

export interface DielineType extends Dieline {
  settings: DielineSettings;
  dielineImage: DielineImage | null;
  modelImage: ModelImage | null;
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
        <TableCell>
          <Image
            src={dieline.dielineImage?.url ?? placeholder}
            alt=""
            width={45}
            height={45}
            className="object-cover aspect-square rounded-sm"
          />
        </TableCell>
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
          <DielineStatusSetter dieline={dieline} />
        </TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            <ActionButton dialogClassName="min-w-4xl" icon={Settings}>
              <DialogTitle>Update Dieline</DialogTitle>
              <DielineSettingsForm categories={categories} dieline={dieline} />
            </ActionButton>
            <ActionButton
              icon={Pencil}
              href={`/editor/${dieline.slug}`}
              target="_blank"
            />
            <DuplicateButton dielineId={dieline.id} />
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
