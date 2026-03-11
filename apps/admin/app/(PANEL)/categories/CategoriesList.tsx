import { deleteCategory } from "@/actions/categories";
import DeleteButton from "@/components/DeleteButton";
import { CategoriesForm } from "@/components/forms/CategoriesForm";
import { mainURL } from "@/data/envs";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil, Trash } from "lucide-react";

export type Category = {
  id: number;
  title: string;
  slug: string;
  _count: { dieline: number };
};

function CategoriesList({
  data,
  type,
}: {
  data: Category[];
  type: "model" | "usage";
}) {
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
          <ActionButton icon={Pencil}>
            <DialogTitle className="capitalize">
              Update Category By {type}
            </DialogTitle>
            <CategoriesForm type={type} category={data} />
          </ActionButton>
          <DeleteButton deleteFn={deleteCategory} id={data.id} args={type} />
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
