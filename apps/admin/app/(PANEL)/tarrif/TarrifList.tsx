import { deleteUser } from "@/actions/user";
import DeleteButton from "@/components/DeleteButton";
import { TarrifForm, TarrifType } from "@/components/forms/TarrifForm";
import { TarrifFeature } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { Badge } from "@repo/ui/components/badge";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";
import { Pencil } from "lucide-react";

const TarrifList = ({
  data,
  features,
}: {
  data: TarrifType[];
  features: TarrifFeature[];
}) => {
  const renderRows = (tarrif: TarrifType) => {
    return (
      <TableRow key={tarrif.id}>
        <TableCell>{tarrif.title}</TableCell>
        <TableCell className="text-center capitalize">{tarrif.key}</TableCell>
        <TableCell className="text-center space-x-2">
          <Badge variant={"outline"}>
            {formatPrice(tarrif.price?.monthly ?? 0, true, "en")}
          </Badge>
          <Badge variant={"outline"}>
            {formatPrice(tarrif.price?.threeMonth ?? 0, true, "en")}
          </Badge>
          <Badge variant={"outline"}>
            {formatPrice(tarrif.price?.annual ?? 0, true, "en")}
          </Badge>
        </TableCell>
        <TableCell>
          <div
            className={cn(
              tarrif.isRecommended ? "bg-green-500" : "bg-muted-foreground",
              "w-5 h-1.5 rounded-full mx-auto",
            )}
          />
        </TableCell>
        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil}>
            <DialogTitle>Update User</DialogTitle>
            <TarrifForm tarrif={tarrif} features={features} />
          </ActionButton>
          <DeleteButton deleteFn={deleteUser} id={tarrif.id} />
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

export default TarrifList;

const columns = [
  { label: "Title" },
  { label: "Key" },
  { label: "Price" },
  { label: "Recommended" },
  { label: "Action" },
];
