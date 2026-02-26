"use client";

import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  LineSpec,
  RectangleSpec,
  ShapesKey,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import { Label } from "@repo/ui/components/label";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import LineProps from "./props/LineProps";
import PropsProvider from "./props/PropsProvider";
import RectangleProps from "./props/RectangleProps";

const Editor = () => {
  const [editorMode, setEditorMode] = useState<ShapesKey | null>(null);
  const shapesList: ShapesKey[] = ["line", "rectangle"];

  const { selectedShape, clearSelection } = useSelectShapeStore();
  const {
    dielineSpec: { shapes },
  } = useDielineSpecStore();

  const selectedParent = selectedShape?.parent;
  const selectedChild = selectedShape?.child;
  const data = selectedShape
    ? shapes[selectedShape.parent]![selectedShape.child]
    : null;

  useEffect(() => {
    setEditorMode(selectedParent ?? null);
  }, [selectedShape]);

  const handleCloseEditor = () => {
    setEditorMode(null);
    clearSelection();
  };

  switch (editorMode) {
    case "line":
      return (
        <PropsProvider<LineSpec>
          key={`${selectedParent} ${selectedChild}`}
          initialData={
            (data as LineSpec | undefined) ?? {
              length: "",
              layer: "trim",
            }
          }
          close={handleCloseEditor}
          shapeKey="line"
        >
          {({ input, setInput }) => (
            <LineProps setInput={setInput} input={input} />
          )}
        </PropsProvider>
      );
    case "rectangle":
      return (
        <PropsProvider<RectangleSpec>
          initialData={
            (data as RectangleSpec | undefined) ?? {
              width: "",
              height: "",
              layer: "trim",
            }
          }
          close={handleCloseEditor}
          shapeKey="rectangle"
        >
          {({ input, setInput }) => (
            <RectangleProps setInput={setInput} input={input} />
          )}
        </PropsProvider>
      );
    default:
      return (
        <div>
          {shapesList.map((key, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center hover:bg-gray-200/50 cursor-pointer px-2 py-2.5 rounded-md"
              onClick={() => setEditorMode(key)}
            >
              <Label className="capitalize">{key}</Label>
              <PlusCircle size={14} />
            </div>
          ))}
        </div>
      );
  }
};

export default Editor;
