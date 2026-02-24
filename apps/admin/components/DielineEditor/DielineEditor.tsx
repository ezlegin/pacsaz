"use client";

import DielineLayer from "@/components/DielineEditor/DielineLayer";
import Settings from "@/components/DielineEditor/settings/Settings";
import Drawer from "@repo/dieline-core/drawer";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import dynamic from "next/dynamic";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

const DielineEditor = ({ slug }: { slug: string }) => {
  const { isRendering } = useDielineGenerator(Drawer);

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full grid grid-cols-[320px_1fr_320px]">
        <div className="bg-muted border-r p-5 z-10">
          <DielineLayer />
        </div>

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} />
          </div>
        </div>

        <div className="bg-muted border-l p-5 z-10">
          <Settings />
        </div>
      </div>
    </div>
  );
};

export default DielineEditor;
