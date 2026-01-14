import { mainURL } from "@/data/envs";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { ArrowUpRight } from "lucide-react";

type Category = {
  id: number;
  title: string;
  slug: string;
  count: number;
};

const MostDielinesList = ({ data }: { data: Category[] }) => {
  const renderRows = (data: Category) => {
    return (
      <TableRow key={data.id}>
        <TableCell className="flex gap-0.5">
          <a target="_blank" href={`${mainURL}/dieline/${data.slug}`}>
            {data.slug}
          </a>
          <ArrowUpRight size={12} className="text-muted-foreground" />
        </TableCell>
        <TableCell className="text-center">{data.count}</TableCell>
      </TableRow>
    );
  };

  return <Table data={data} renderRows={renderRows} dir="ltr" />;
};

export default MostDielinesList;
