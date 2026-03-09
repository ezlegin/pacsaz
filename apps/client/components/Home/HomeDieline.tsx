"use client";

import { DIMENSIONS } from "@/data/consts";
import { Dieline } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { materials } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { Card as ShadCard } from "@repo/ui/components/card";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { DimensionInput } from "../product/DimensionsInput";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import { tuckEnd } from "@/public";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  {
    ssr: false,
  },
);

const HomeDieline = ({ dieline: _dieline }: { dieline: Dieline | null }) => {
  const containerClass = "h-175 max-w-225 min-w-225";
  if (!_dieline)
    return (
      <div className={cn(containerClass, "flex justify-center items-center")}>
        <Image
          alt="dieline"
          src={tuckEnd}
          width={800}
          height={800}
          className="h-full w-auto"
        />
      </div>
    );

  const { specs, setSpecs } = useDielineSpecStore();

  // todo
  const dieline = {
    ..._dieline,
    minDimensions: { width: 30, height: 40, length: 30 },
    defaultDimensions: { width: 80, height: 40, length: 130 },
    dimensionsType: ["inner", "outer", "manufacture"],
    materials: [
      materials["f-flute"],
      materials["e-flute"],
      materials["glossy-cardboard"],
    ],
  };

  dieline.defaultDimensions.width = 80;
  dieline.defaultDimensions.length = 130;
  dieline.defaultDimensions.height = 40;
  const { isRendering } = useDielineGenerator(specs);
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();

  useEffect(() => {
    setSpecs(JSON.parse(_dieline.specification));

    setDeveloperToolsCTX("showWatermark", false);
    setDeveloperToolsCTX("showContainer", false);
    setDeveloperToolsCTX("doCenterSVG", true);
  }, []);

  return (
    <div className="relative p-0">
      <DielineLoadingOverlay />

      <div className={containerClass}>
        <SVGPreview
          isRendering={isRendering}
          showControls={false}
          disablePanning
          disableWheel
          type="client"
        />
      </div>

      <ShadCard className="gap-3 max-w-40 absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={dieline.minDimensions[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </ShadCard>
    </div>
  );
};

export default HomeDieline;
