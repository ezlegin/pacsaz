import { deleteFeature } from "@/actions/feature";
import DeleteButton from "@/components/DeleteButton";
import FeatureForm from "@/components/forms/FeatureForm";
import { TarrifFeature } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

const FeaturesList = ({ data }: { data: TarrifFeature[] }) => {
  const renderRows = (feature: TarrifFeature) => {
    return (
      <TableRow key={feature.id}>
        <TableCell>{feature.title}</TableCell>
        <TableCell className="text-center">{feature.type}</TableCell>
        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil}>
            <DialogTitle>Update User</DialogTitle>
            <FeatureForm feature={feature} />
          </ActionButton>
          <DeleteButton deleteFn={deleteFeature} id={feature.id} />
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

export default FeaturesList;

const columns = [{ label: "Feature" }, { label: "Type" }, { label: "Action" }];
