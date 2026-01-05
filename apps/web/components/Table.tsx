import {
  Table as MyTable,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";
import { Frown } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  columns: { label: string; className?: string }[];
  data: any[];
  renderRows: (item: any, index?: number) => ReactNode;
  noDataMessage?: string;
  dir?: "ltr" | "rtl";
}

const Table = ({
  columns,
  data,
  renderRows,
  noDataMessage,
  dir = "rtl",
}: Props) => {
  return (
    <>
      <MyTable>
        <TableHeader>
          <TableRow className="text-muted-foreground text-sm text-left bg-accent">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  dir === "ltr"
                    ? "first:text-left last:text-right"
                    : "first:text-right last:text-left",
                  "h-10",
                  (index !== 0 || index !== columns.length) && "text-center",
                  column.className
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.map((data, index) => renderRows(data, index))}
        </TableBody>
      </MyTable>

      {data.length < 1 && (
        <div className="py-20 text-muted-foreground flex flex-col gap-3 justify-center items-center text-sm">
          <Frown size={80} className="text-gray-400" strokeWidth={1.5} />
          {noDataMessage}
        </div>
      )}
    </>
  );
};

export default Table;
