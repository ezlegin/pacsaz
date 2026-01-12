import ActionButton from "@/components/ActionButton";
import { mainURL } from "@/data/envs";
import { Badge } from "@repo/ui/components/badge";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Pencil, Trash } from "lucide-react";

type Dieline = {
  id: number;
  title: string;
  slug: string;
  categories: {
    byUsage: string[];
    byModel: string[];
  };
  downloaded: number;
};

const DielinesList = ({ data }: { data: Dieline[] }) => {
  const renderRows = (data: Dieline) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">{data.title}</TableCell>
        <TableCell className="text-center">
          <a target="_blank" href={`${mainURL}/dieline/${data.slug}`}>
            {data.slug}
          </a>
        </TableCell>
        <TableCell className="text-center flex gap-2 justify-center items-center">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"outline"}>By Usage</Badge>
            </TooltipTrigger>
            <TooltipContent>
              {data.categories.byUsage.join(", ")}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"outline"}>By Model</Badge>
            </TooltipTrigger>
            <TooltipContent>
              {data.categories.byModel.join(", ")}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">{data.downloaded}</TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            <ActionButton icon={Pencil} />
            <ActionButton icon={Trash} />
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
  { label: "Action", className: "" },
];
