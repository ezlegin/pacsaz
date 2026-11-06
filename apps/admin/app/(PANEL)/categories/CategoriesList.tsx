import { deleteCategory } from "@/actions/categories";
import DeleteButton from "@/components/DeleteButton";
import { CategoriesForm } from "@/components/forms/CategoriesForm";
import { mainURL } from "@/data/envs";
import ActionButton from "@/components/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

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
          {/* The client's category page; this used to link to /dieline/<slug>,
              which is a template page and 404s for a category. */}
          <a
            target="_blank"
            href={`${mainURL}/dielines/category/${data.slug}`}
            className="font-mono text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            {data.slug}
          </a>
        </TableCell>
        <TableCell className="text-center">{data._count.dieline}</TableCell>
        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit {type} category</DialogTitle>
            <CategoriesForm type={type} category={data} />
          </ActionButton>
          <DeleteButton deleteFn={deleteCategory} id={data.id} args={type} itemLabel={`the category "${data.title}"`} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No categories match." />
    </Card>
  );
}

export default CategoriesList;

const columns = [
  { label: "Label", className: "" },
  { label: "Slug", className: "" },
  { label: "Dielines", className: "" },
  { label: "Actions", className: "" },
];
