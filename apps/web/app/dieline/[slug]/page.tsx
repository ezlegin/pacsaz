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

export default function Page() {
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(160);
  const [length, setLength] = useState(30);

  const svg = model(width, height);

  const setDimension = (key: DimensionKey, value: number) => {
    if (key === "width") setWidth(value);
    if (key === "height") setHeight(value);
    if (key === "length") setLength(value);
  };

  return (
    <div className="grid h-full grid-cols-[320px_1fr_320px] gap-6 px-10 py-4">
      {/* LEFT PANEL */}
      <ProductDetails
        dimensions={{ height, width, length }}
        setDimension={setDimension}
      />

      {/* RIGHT PREVIEW */}
      <div className="flex items-center justify-center overflow-auto">
        <div
          className="w-fit rounded-sm bg-white"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Card className="p-1 flex items-center gap-3 flex-row text-muted-foreground">
            <Button variant={"ghost"}>
              <ZoomIn size={20} className="scale-110" />
            </Button>

            <div className="h-5">
              <Separator orientation="vertical" />
            </div>

            <Button variant={"ghost"}>
              <ZoomOut size={20} className="scale-110" />
            </Button>
          </Card>
        </div>
      </div>

      {/* LEFT PANEL */}
      <ProductDetails
        dimensions={{ height, width, length }}
        setDimension={setDimension}
      />
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
