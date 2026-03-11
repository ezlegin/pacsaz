import { mainURL } from "@/data/envs";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil, Trash } from "lucide-react";

type Category = {
  title: string;
  slug: string;
  _count: { dieline: number };
};

function CategoriesList({ data }: { data: Category[] }) {
  const renderRows = (data: Category) => {
    return (
      <TableRow key={data.slug}>
        <TableCell>{data.title}</TableCell>
        <TableCell className="text-center">
          <a target="_blank" href={`${mainURL}/dieline/${data.slug}`}>
            {data.slug}
          </a>
        </TableCell>
        <TableCell className="text-center">{data._count.dieline}</TableCell>
        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil} />
          <ActionButton icon={Trash} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" />
    </Card>
  );
}

export default CategoriesList;

const columns = [
  { label: "Label", className: "" },
  { label: "Slug", className: "" },
  { label: "Dielines", className: "" },
  { label: "Action", className: "" },
];
