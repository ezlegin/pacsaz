"use client";

import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import DielineLayer from "@/components/DielineEditor/DielineLayer";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addEffects, effectsSelectors } from "@repo/store/slices/effectsSlice";
import { addModels, modelsSelectors } from "@repo/store/slices/modelsSlice";
import { addRulers, rulersSelectors } from "@repo/store/slices/rulersSlice";
import { addShapes, shapesSelectors } from "@repo/store/slices/shapesSlice";
import {
  addVariables,
  variablesSelectors,
} from "@repo/store/slices/variablesSlice";
import { IEffect, IVar } from "@repo/store/types";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Effects } from "./effects/Effects";
import Settings from "./settings/Settings";
import Tools from "./Tools";
import Variables from "./Variables";
import { useMemo } from "react";

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

  const shapes = useAppSelector(shapesSelectors.selectAll);
  const rulers = useAppSelector(rulersSelectors.selectAll);
  const models = useAppSelector(modelsSelectors.selectAll);

  const specification = useMemo(
    () => ({ shapes, rulers, models }),
    [shapes, rulers, models],
  );
  const variables = useAppSelector(variablesSelectors.selectAll);
  const effects = useAppSelector(effectsSelectors.selectAll);

  const dielineForGenerator = useMemo(
    () => ({ ...dieline, specification, variables, effects }),
    [dieline, specification, variables, effects],
  );

  const { isRendering } = useDielineGenerator(dielineForGenerator, null, false);

  useEffect(() => {
    dispatch(addShapes(JSON.parse(dieline.specification).shapes));
    dispatch(addModels(JSON.parse(dieline.specification).models));
    dispatch(addRulers(JSON.parse(dieline.specification).rulers));
    dispatch(addVariables(JSON.parse(dieline.variable) as IVar.VariableMap));
    dispatch(addEffects(JSON.parse(dieline.effect) as IEffect.EffectsMap));
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full grid grid-cols-[280px_1fr_280px]">
        <div className="bg-muted border-r p-3 z-10">
          <DielineLayer dieline={dieline} categories={categories} />
        </div>
        <div className="relative bg-gray-50">
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
                Effects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-3">
              <Tools />
            </TabsContent>
            <TabsContent value="variables">
              <Variables />
            </TabsContent>
            <TabsContent value="settings">
              <Effects />
            </TabsContent>
          </Tabs>

          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button
                variant={"primaryForeground"}
                className="absolute right-0 bottom-4 rounded-l-full rounded-r-none"
              >
                <SettingsIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <Settings isRendering={isRendering} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
};

export default DielineEditor;
