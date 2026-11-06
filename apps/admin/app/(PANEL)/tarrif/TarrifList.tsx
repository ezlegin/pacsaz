import { deleteTarrif } from "@/actions/tarrif";
import DeleteButton from "@/components/DeleteButton";
import { TarrifForm, TarrifType } from "@/components/forms/TarrifForm";
import { TarrifFeature } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { Badge } from "@repo/ui/components/badge";
import ActionButton from "@/components/ActionButton";
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
        <TableCell className="text-center">
          {tarrif.price ? (
            <div className="flex flex-wrap justify-center gap-1.5">
              {(["monthly", "threeMonth", "annual"] as const).map((period) => (
                <Badge key={period} variant="outline" className="gap-1">
                  <span className="text-muted-foreground">{periodLabel[period]}</span>
                  {formatPrice(tarrif.price![period], true, "en")}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-destructive">No price set</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs",
              tarrif.isRecommended
                ? "border-green-200 bg-green-50 text-green-700"
                : "text-muted-foreground",
            )}
          >
            {tarrif.isRecommended ? "Recommended" : "—"}
          </span>
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit tariff</DialogTitle>
            <TarrifForm tarrif={tarrif} features={features} />
          </ActionButton>
          <DeleteButton deleteFn={deleteTarrif} id={tarrif.id} itemLabel={`the tariff "${tarrif.title}"`} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No tariffs yet." />
    </Card>
  );
};

export default TarrifList;

const periodLabel = { monthly: "1 mo", threeMonth: "3 mo", annual: "1 yr" } as const;

const columns = [
  { label: "Title" },
  { label: "Key" },
  { label: "Prices" },
  { label: "Recommended" },
  { label: "Actions" },
];
