"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { notFound } from "next/navigation";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
import ProductLoadingOverlay from "./ProductLoadingOverlay";
import { useEffect } from "react";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import dynamic from "next/dynamic";
const SVGPreview = dynamic(() => import("./SVGPreview"), { ssr: false });

const DielineGenerator = ({ slug }: { slug: string }) => {
  const { setDeveloperToolsCTX } = useDeveloperToolsStore();

  const dieline = dielineImporter(slug);

  if (!dieline) return notFound();

  const { isRendering } = useDielineGenerator(dieline);

  useEffect(() => {
    setDeveloperToolsCTX("showContainer", true);
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, []);

  return (
    <div className="h-full">
      <ProductLoadingOverlay />

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
            <SVGPreview isRendering={isRendering} />
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
