"use client";

import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  CircleSpec,
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
import CircleProps from "./props/CircleProps";

const Editor = () => {
  const [editorMode, setEditorMode] = useState<ShapesKey | null>(null);
  const shapesList: ShapesKey[] = ["line", "rectangle", "circle"];

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
          data={data as LineSpec}
          close={handleCloseEditor}
          shapeKey="line"
        >
          {({ form }) => <LineProps form={form} />}
        </PropsProvider>
      );
    case "rectangle":
      return (
        <PropsProvider<RectangleSpec>
          data={data as RectangleSpec}
          close={handleCloseEditor}
          shapeKey="rectangle"
        >
          {({ form }) => <RectangleProps form={form} />}
        </PropsProvider>
      );
    case "circle":
      return (
        <PropsProvider<CircleSpec>
          data={data as CircleSpec}
          close={handleCloseEditor}
          shapeKey="circle"
        >
          {({ form }) => <CircleProps form={form} />}
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
              <Label className="capitalize cursor-pointer">{key}</Label>
              <PlusCircle size={14} />
            </div>
          ))}
        </div>
      );
  }
};

export default Editor;
