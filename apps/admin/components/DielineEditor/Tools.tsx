"use client";

import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { clearSelection } from "@repo/store/slices/selectionSlice";
import { ISpec } from "@repo/store/types";
import { Label } from "@repo/ui/components/label";
import {
  ChevronUp,
  Circle,
  Hexagon,
  LucideIcon,
  Parentheses,
  PlusCircle,
  Ruler,
  Slash,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import RulerProps from "./props/RulerProps";
import ShapesPropsProvider from "./props/ShapesPropsProvider";
import ArcProps from "./props/shapes/ArcProps";
import CircleProps from "./props/shapes/CircleProps";
import LineProps from "./props/shapes/LineProps";
import LinesProps from "./props/shapes/LinesProps";
import PolygonProps from "./props/shapes/PolygonProps";
import RectangleProps from "./props/shapes/RectangleProps";

type EditorMode = {
  stack: ISpec.Stack;
  key: ISpec.ShapesKey | "ruler";
};

const Tools = () => {
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);

  const shapesList: { key: ISpec.ShapesKey; Icon: LucideIcon }[] = [
    { key: "line", Icon: Slash },
    { key: "lines", Icon: ChevronUp },
    { key: "rectangle", Icon: Square },
    { key: "circle", Icon: Circle },
    { key: "polygon", Icon: Hexagon },
    { key: "arc", Icon: Parentheses },
  ];

  const selection = useAppSelector((s) => s.selection.selection);
  const dispatch = useAppDispatch();

  useEffect(() => {
    switch (selection?.stack) {
      case "shape":
        setEditorMode({ stack: selection.stack, key: selection.type });
        break;
      case "model":
        setEditorMode({ stack: selection.stack, key: selection.type });
        break;
      case "ruler":
        setEditorMode({ stack: selection.stack, key: selection.type });
        break;
      default:
        setEditorMode(null);
        break;
    }
  }, [selection]);

  const handleCloseEditor = () => {
    setEditorMode(null);
    dispatch(clearSelection());
  };
  const shapePropsComponents = {
    line: LineProps,
    lines: LinesProps,
    rectangle: RectangleProps,
    circle: CircleProps,
    polygon: PolygonProps,
    arc: ArcProps,
  };

  if (editorMode) {
    if (editorMode.stack === "shape") {
      const editorKey = editorMode.key as ISpec.ShapesKey;
      const Component = shapePropsComponents[editorKey];
      return (
        <ShapesPropsProvider<ISpec.ShapesSpec>
          key={selection?.id}
          data={selection as ISpec.ShapesSpec}
          close={handleCloseEditor}
          shapeKey={editorKey}
        >
          {({ form }) => <Component form={form} />}
        </ShapesPropsProvider>
      );
    }

    if (editorMode.stack === "ruler") {
      return (
        <RulerProps
          key={selection?.id}
          close={handleCloseEditor}
          selection={selection as ISpec.Ruler}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Tools</Label>
        <div>
          {shapesList.map(({ Icon, key }, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center hover:bg-gray-200/50 cursor-pointer px-2 py-2.5 rounded-md group"
              onClick={() => setEditorMode({ stack: "shape", key })}
            >
              <Label className="capitalize cursor-pointer">
                <Icon
                  size={14}
                  className="text-muted-foreground group-hover:text-foreground"
                />
                {key}
              </Label>
              <PlusCircle size={14} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Ruler</Label>
        <div
          className="flex justify-between items-center hover:bg-gray-200/50 cursor-pointer px-2 py-2.5 rounded-md group"
          onClick={() => setEditorMode({ stack: "ruler", key: "ruler" })}
        >
          <Label className="capitalize cursor-pointer">
            <Ruler
              size={14}
              className="text-muted-foreground group-hover:text-foreground"
            />
            Ruler
          </Label>
          <PlusCircle size={14} />
        </div>
      </div>
    </div>
  );
};

export default Tools;
