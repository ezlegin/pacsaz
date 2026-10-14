"use client";

import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import DielineLayer from "@/components/DielineEditor/DielineLayer";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addNodes, nodesSelector } from "@repo/store/slices/nodesSlice";
import { addRulers, rulersSelectors } from "@repo/store/slices/rulersSlice";
import {
  addVariables,
  variablesSelectors,
} from "@repo/store/slices/variablesSlice";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import Settings from "./settings/Settings";
import Tools from "./Tools";
import Variables from "./Variables";
import { IVar } from "@repo/store/types";

const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

export type EditorComponentType = "create" | "update";

const DielineEditor = ({
  dieline,
  categories,
}: {
  dieline: DielineType;
  categories: Categories;
}) => {
  const dispatch = useAppDispatch();

  const nodes = useAppSelector(nodesSelector);
  const rulers = useAppSelector(rulersSelectors.selectAll);

  const specification = useMemo(() => ({ nodes, rulers }), [nodes, rulers]);
  const variables = useAppSelector(variablesSelectors.selectAll);

  const dielineForGenerator = useMemo(
    () => ({ ...dieline, specification, variables }),
    [dieline, specification, variables],
  );

  const { isRendering } = useDielineGenerator(dielineForGenerator, null, false);

  useEffect(() => {
    dispatch(addNodes(JSON.parse(dieline.specification).nodes));
    dispatch(addRulers(JSON.parse(dieline.specification).rulers));
    dispatch(addVariables(JSON.parse(dieline.variable) as IVar.VariableMap));
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full grid grid-cols-[280px_1fr_280px]">
        <div className="bg-muted overflow-y-auto border-r p-3 z-10">
          <DielineLayer dieline={dieline} categories={categories} />
        </div>

        <div className="relative bg-gray-50">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} type="editor" />
          </div>
        </div>

        <div className="bg-muted overflow-y-auto border-l p-3 z-10">
          <Tabs defaultValue="tools">
            <TabsList className="w-full px-0">
              <TabsTrigger className="cursor-pointer" value="tools">
                Tools
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="settings">
                Settings
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="variables">
                Variables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-3">
              <Tools />
            </TabsContent>
            <TabsContent value="settings">
              <Settings isRendering={isRendering} />
            </TabsContent>
            <TabsContent value="variables">
              <Variables />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DielineEditor;
