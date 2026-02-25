"use client";

import {
  LineSpec,
  RectangleSpec,
  Shapes,
  ShapesKey,
} from "@repo/store/dieline/dielineSpec.store";
import { Label } from "@repo/ui/components/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import LineSettings from "./props/LineProps";
import RectangleSettings from "./props/RectangleProps";
import PropsProvider from "./props/PropsProvider";

const Editor = () => {
  const [shapeType, setShapeType] = useState<keyof Shapes | null>(null);
  const shapesList: { key: ShapesKey }[] = [
    { key: "line" },
    { key: "rectangle" },
  ];

  switch (shapeType) {
    case "line":
      return (
        <PropsProvider<LineSpec> initialData={{ length: "", layer: "trim" }}>
          {({ input, setInput }) => (
            <LineSettings
              setShapeType={setShapeType}
              input={input}
              setInput={setInput}
            />
          )}
        </PropsProvider>
      );
    case "rectangle":
      return (
        <PropsProvider<RectangleSpec>
          initialData={{ width: "", height: "", layer: "trim" }}
        >
          {({ input, setInput }) => (
            <RectangleSettings
              setShapeType={setShapeType}
              input={input}
              setInput={setInput}
            />
          )}
        </PropsProvider>
      );
    default:
      return (
        <div>
          {shapesList.map(({ key }, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center hover:bg-gray-200/50 cursor-pointer px-2 py-2.5 rounded-md"
              onClick={() => setShapeType(key)}
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
