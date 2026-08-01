"use client";

import { DielineType } from "@/data/types";
import { CustomDielineSettings } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { UserType } from "./DielineDownloadButton";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
import { IVar, IEffect, ISpec } from "@repo/store/types";
import { useAppDispatch } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

const DielineGenerator = ({
  dieline,
  customSettings,
  user,
}: {
  user: UserType | null;
  dieline: DielineType;
  customSettings?: CustomDielineSettings | null;
}) => {
  const dispatch = useAppDispatch();

  const specs = useMemo(
    () => JSON.parse(dieline.specification) as ISpec.Specs,
    [dieline.specification],
  );
  const variables = useMemo(
    () => JSON.parse(dieline.variable) as IVar.VariableMap,
    [dieline.variable],
  );
  const effects = useMemo(
    () => JSON.parse(dieline.effect) as IEffect.EffectsMap,
    [dieline.effect],
  );

  const { isRendering } = useDielineGenerator(
    {
      ...dieline,
      specification: specs,
      settings: dieline.settings,
      customSettings,
      variables,
      effects,
    },
    user,
  );

  useEffect(() => {
    dispatch(setDeveloperTool({ key: "showContainer", value: true }));
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, []);

  return (
    <div className="h-full">
      <DielineLoadingOverlay />

      <div className="h-full grid grid-cols-[320px_1fr_300px] p-3">
        <DielineSettings
          slug={dieline.slug}
          isRendering={isRendering}
          user={user}
        />

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} type="client" />
          </div>
        </div>

        <ProductInfo imageSrc={dieline.modelImage?.url} />
      </div>
    </div>
  );
};

export default DielineGenerator;
