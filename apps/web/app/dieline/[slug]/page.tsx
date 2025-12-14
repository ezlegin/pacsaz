"use client";

import ProductDetails, {
  DimensionKey,
} from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import M from "makerjs";
import { useState } from "react";

export default function Page() {
  const [width, setWidth] = useState(90);
  const [height, setHeight] = useState(160);
  const [length, setLength] = useState(30);

  const svg = model(width, height);

  const setDimension = (key: DimensionKey, value: number) => {
    if (key === "width") setWidth(value);
    if (key === "height") setHeight(value);
    if (key === "length") setLength(value);
  };

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        dimensions={{ height, width, length }}
        setDimension={setDimension}
      />

      <SVGPreview svg={svg} />

      <ProductInfo height={height} width={width} length={length} />
    </div>
  );
}

function model(width: number, height: number) {
  const model: M.IModel = { paths: {}, models: {} };
  const rect = new M.models.Rectangle(width * 2, height);

  //! BLEED
  model.models!["bleed"] = M.model.outline(rect, 3, 1);
  model.models!["bleed"].layer = "bleed";

  //! TRIM
  const trim = rect;
  model.models!["trim"] = trim;
  model.models!["trim"].layer = "trim";

  //! FOLD
  const fold = new M.models.ConnectTheDots(false, [
    [width, 0],
    [width, height],
  ]);
  model.models!["fold"] = fold;
  model.models!["fold"].layer = "fold";

  return M.exporter.toSVG(model, {
    units: "mm",
    layerOptions: {
      bleed: { stroke: "green", fill: "white" },
      trim: { stroke: "blue" },
      fold: { stroke: "red", cssStyle: "stroke-dasharray:5,2;" },
    },
  });
}
