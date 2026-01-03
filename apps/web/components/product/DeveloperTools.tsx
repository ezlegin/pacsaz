import { SVGModelSizes } from "@/lib/dielines/core/types";
import { toMm } from "@/utils/sizeConvertor";
import { CardTitle, CardContent, Card } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import React from "react";

type booleanSetter = (val: boolean) => void;
const DeveloperTools = ({
  setDoCenterSVG,
  setShowAnchors,
  setShowOverallDimensions,
  setShowWatermark,
  doCenterSVG,
  showOverallDimensions,
  showWatermark,
  showAnchors,
  sizes,
  slug,
}: {
  slug: string | undefined;
  sizes: SVGModelSizes;
  showAnchors: boolean;
  showWatermark: boolean;
  showOverallDimensions: boolean;
  doCenterSVG: boolean;
  setShowAnchors: booleanSetter;
  setShowWatermark: booleanSetter;
  setShowOverallDimensions: booleanSetter;
  setDoCenterSVG: booleanSetter;
}) => {
  return (
    <div className="absolute left-0 bottom-0 w-fit m-3 opacity-0 hover:opacity-100 transition-opacity">
      <Card dir="ltr" className="p-4 gap-1">
        <CardTitle>Developer Tools:</CardTitle>

        <CardContent className="p-1 text-sm flex flex-col gap-2">
          <div className="flex justify-between">
            <p>Slug:</p>
            <p>{slug}</p>
          </div>
          <div className="flex justify-between">
            <p>Trim Size:</p>
            <p>
              {toMm(sizes.trim.width).toFixed()} x{" "}
              {toMm(sizes.trim.height).toFixed()} mm
            </p>
          </div>
          <div className="flex justify-between">
            <p>Bleed Size:</p>
            <p>
              {toMm(sizes.bleed.width).toFixed()} x{" "}
              {toMm(+sizes.bleed.height).toFixed()} mm
            </p>
          </div>
          <div className="flex justify-between">
            <p>Bleed Amount:</p>
            <p>{toMm(sizes.bleedAmount)} mm</p>
          </div>
          <div className="flex justify-between">
            <p>Show Anchors</p>
            <Switch checked={showAnchors} onCheckedChange={setShowAnchors} />
          </div>
          <div className="flex justify-between">
            <p>Show Watermark</p>
            <Switch
              checked={showWatermark}
              onCheckedChange={setShowWatermark}
            />
          </div>
          <div className="flex justify-between">
            <p>Show Overall Dimensions</p>
            <Switch
              checked={showOverallDimensions}
              onCheckedChange={setShowOverallDimensions}
            />
          </div>
          <div className="flex justify-between">
            <p>Do Center the SVG</p>
            <Switch checked={doCenterSVG} onCheckedChange={setDoCenterSVG} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperTools;
