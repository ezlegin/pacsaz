"use client";

import { useState } from "react";
import M from "makerjs";
import ProductDetails from "@/components/product/ProductDetails";

export default function Page() {
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(160);
  const [length, setLength] = useState(30);

  const svg = model(width, height);

  return (
    <div className="p-10 space-y-6">
      {/* INPUT CONTROLS */}
      <ProductDetails
        width={width}
        setHeight={setHeight}
        height={height}
        setWidth={setWidth}
        length={length}
        setLength={setLength}
      />

      {/* RENDER SVG */}
      <div className="flex justify-center">
        <div
          className="bg-white w-fit rounded-sm"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
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
