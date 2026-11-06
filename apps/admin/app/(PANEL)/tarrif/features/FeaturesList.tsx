import { deleteFeature } from "@/actions/feature";
import DeleteButton from "@/components/DeleteButton";
import FeatureForm from "@/components/forms/FeatureForm";
import { TarrifFeature } from "@repo/db";
import ActionButton from "@/components/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";

const FeaturesList = ({ data }: { data: TarrifFeature[] }) => {
  const renderRows = (feature: TarrifFeature) => {
    return (
      <TableRow key={feature.id}>
        <TableCell>{feature.title}</TableCell>
        <TableCell className="text-center">
          <Badge variant={feature.type === "paid" ? "lightYellow" : "outline"}>
            {feature.type === "paid" ? "Paid" : "General"}
          </Badge>
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit feature</DialogTitle>
            <FeatureForm feature={feature} />
          </ActionButton>
          <DeleteButton deleteFn={deleteFeature} id={feature.id} itemLabel={`the feature "${feature.title}"`} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No features yet." />
    </Card>
  );
};

export default FeaturesList;

const columns = [{ label: "Feature" }, { label: "Type" }, { label: "Actions" }];
