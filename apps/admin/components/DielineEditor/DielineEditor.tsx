"use client";

import DielineLayer from "@/components/DielineEditor/DielineLayer";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import dynamic from "next/dynamic";
import Settings from "./settings/Settings";
import Tools from "./Tools";
import Variables from "./Variables";
import { Dieline } from "@repo/db";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

export type EditorComponentType = "create" | "update";

const DielineEditor = ({ dieline }: { dieline?: Dieline }) => {
  const { isRendering } = useDielineGenerator();

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full grid grid-cols-[280px_1fr_280px]">
        <div className="bg-muted border-r p-3 z-10">
          <DielineLayer dieline={dieline} />
        </div>

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} type="editor" />
          </div>
        </div>

        <div className="bg-muted border-l p-3 z-10">
          <Tabs defaultValue="tools">
            <TabsList className="w-full px-0">
              <TabsTrigger className="cursor-pointer" value="tools">
                Tools
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="variables">
                Variables
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="settings">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-3">
              <Tools />
            </TabsContent>
            <TabsContent value="variables">
              <Variables />
            </TabsContent>
            <TabsContent value="settings">
              <Settings isRendering={isRendering} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DielineEditor;
