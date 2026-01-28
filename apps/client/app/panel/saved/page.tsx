import React from "react";
import SavedDielinesList, { SavedDieline } from "./SavedDielinesList";
import Search from "@repo/ui/components/custom/Search";
import Pagination from "@repo/ui/components/custom/Pagination";
import { globalPageSize } from "@repo/lib/data/consts";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex">
        <Search placeholder="جستجو..." />
      </div>

      <SavedDielinesList data={data} />
      <Pagination pageSize={globalPageSize} totalItems={data.length} />
    </div>
  );
};

export default page;

const data: SavedDieline[] = [
  {
    id: 1,
    bleed: 5,
    dimensions: "90x160x50 mm",
    dieline: "tuck-end",
    dimenstionsType: "manufacture",
    material: "b-flute",
    thickness: 3,
    title: "آقای رحیمی",
    downloadedAt: new Date(),
  },
  {
    id: 2,
    bleed: 3,
    dimensions: "90x160 mm",
    dieline: "postal-card",
    dimenstionsType: "manufacture",
    material: "f-flute",
    thickness: 1.2,
    title: "شرکت پک ساز",
    downloadedAt: new Date(),
  },
];
