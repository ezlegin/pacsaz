"use client";

import { Dieline, DielineSettings as DielineSettingsType } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import ProductInfo from "./ProductInfo";
import DielineSettings from "./DielineSettings";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

interface DielineType extends Dieline {
  settings: DielineSettingsType | null;
}

const DielineGenerator = ({
  dieline,
  customSettings,
}: {
  dieline: DielineType;
  customSettings?: DielineSettingsType | null;
}) => {
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();
  const specs = JSON.parse(dieline.specification) as ISpec.Specs;
  const { isRendering } = useDielineGenerator(
    {
      ...dieline,
      specification: specs,
      settings: customSettings ?? dieline.settings!,
    },
    "client",
  );

  useEffect(() => {
    setDeveloperToolsCTX("showContainer", true);
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, []);

  return (
    <div className="h-full">
      <DielineLoadingOverlay />

      <div className="h-full grid grid-cols-[320px_1fr_300px] p-3">
        <DielineSettings slug={dieline.slug} isRendering={isRendering} />

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} type="client" />
          </div>
        </div>

        <ProductInfo />
      </div>
    </div>
  );
};

export default DielineGenerator;
