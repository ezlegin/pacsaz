"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { notFound } from "next/navigation";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import { useEffect } from "react";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import dynamic from "next/dynamic";
import { Dieline } from "@repo/db";
import { materials } from "@repo/store/data/dieline";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

const DielineGenerator = ({ dieline: _dieline }: { dieline: Dieline }) => {
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();

  const dieline = {
    ..._dieline,
    minDimensions: { width: 50, height: 50, length: 50 },
    defaultDimensions: { width: 90, height: 50, length: 160 },
    dimensionsType: ["inner", "outer", "manufacture"],
    materials: [materials["f-flute"]],
  };

  if (!dieline) return notFound();

  const { isRendering } = useDielineGenerator(dieline);

  useEffect(() => {
    setDeveloperToolsCTX("showContainer", true);
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, []);

  return (
    <div className="h-full">
      <DielineLoadingOverlay />

      <div className="h-full grid grid-cols-[320px_1fr_300px] p-3">
        <DielineSettings
          minDimensions={dieline.minDimensions}
          dimensionsType={dieline.dimensionsType}
          slug={dieline.slug}
          materials={dieline.materials}
          isRendering={isRendering}
        />

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} type="client" />
          </div>
        </div>

        <ProductInfo
          dimensionsType={dieline.dimensionsType}
          slug={dieline.slug}
        />
      </div>
    </div>
  );
};

export default DielineGenerator;
