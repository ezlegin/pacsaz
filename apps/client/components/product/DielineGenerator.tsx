"use client";

import { Dieline } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { materials } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

const DielineGenerator = ({ dieline: _dieline }: { dieline: Dieline }) => {
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();
  const { specs, setSpecs } = useDielineSpecStore();
  const { isRendering } = useDielineGenerator(specs);

  useEffect(() => {
    setSpecs(JSON.parse(_dieline.specification));
    setDeveloperToolsCTX("showContainer", true);
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, []);

  // todo
  const dieline = {
    ..._dieline,
    minDimensions: { width: 50, height: 50, length: 50 },
    defaultDimensions: { width: 90, height: 50, length: 160 },
    dimensionsType: ["inner", "outer", "manufacture"],
    materials: [
      materials["f-flute"],
      materials["e-flute"],
      materials["glossy-cardboard"],
    ],
  };

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
