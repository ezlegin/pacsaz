"use client";

import { useState } from "react";
import M from "makerjs";
import ProductDetails, {
  DimensionKey,
} from "@/components/product/ProductDetails";
import { Card } from "@workspace/ui/components/card";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";

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
  const artboardPadding = 10;

  // Artboard
  const artboard = new M.models.Rectangle(width * 2, height);
  model.models!["artboard"] = M.model.outline(artboard, artboardPadding, 1);
  model.models!["artboard"].layer = "artboard";

  //! TRIM
  const trim = new M.models.Rectangle(width * 2, height);
  model.models!["trim"] = trim;
  model.models!["trim"].layer = "trim";

  //! FOLD
  const fold = new M.paths.Line([width, 0], [width, height]);
  model.paths!["fold"] = fold;
  model.paths!["fold"].layer = "fold";

  //! BLEED
  model.models!["bleed"] = M.model.outline(trim, 3, 1);
  model.models!["bleed"].layer = "bleed";

  // EXPORT SVG
  const svg = M.exporter.toSVG(model, {
    units: "mm",
    stroke: "black",
    strokeWidth: "1",
    layerOptions: {
      trim: { stroke: "blue" },
      fold: { stroke: "red" },
      bleed: { stroke: "green" },
      artboard: { strokeWidth: "0" },
    },
  });

  return svg;
}
