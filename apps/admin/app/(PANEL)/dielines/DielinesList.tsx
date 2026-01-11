import ViewButton from "@/components/ViewButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";

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

const DielinesList = () => {
  const data: Dieline[] = [
    {
      id: 1,
      title: "جعبه دو طرف درب",
      slug: "tuck-end",
      categories: {
        byUsage: ["medicine", "food"],
        byModel: ["tuck-end"],
      },
      downloaded: 290,
    },
    {
      id: 2,
      title: "جعبه اسنپ لاک",
      slug: "tuck-end-snap-lock",
      categories: {
        byUsage: ["medicine", "food"],
        byModel: ["tuck-end"],
      },
      downloaded: 373,
    },
  ];

  const renderRows = (data: Dieline) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">{data.title}</TableCell>
        <TableCell className="text-center">{data.slug}</TableCell>
        <TableCell className="text-center">{data.title}</TableCell>
        <TableCell className="text-center">{data.downloaded}</TableCell>
        <TableCell>
          <div className="flex justify-end">
            <ViewButton />
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
  { label: "View", className: "" },
];
