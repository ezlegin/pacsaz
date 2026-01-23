"use client";

import { useDimensionStore } from "@repo/store/dimension.store";

const DimTest = () => {
  const { dimension } = useDimensionStore();
  return (
    <div className="p-10">
      <div>w: {dimension.width}mm</div>
      <div>l: {dimension.length}mm</div>
      <div>h: {dimension.height}mm</div>
    </div>
  );
};

export default DimTest;
