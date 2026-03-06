"use client";

import { useSelectionStore } from "@repo/store/app/selection.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
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
import ArcProps from "./props/Tools/ArcProps";
import CircleProps from "./props/Tools/CircleProps";
import LineProps from "./props/Tools/LineProps";
import LinesProps from "./props/Tools/LinesProps";
import PolygonProps from "./props/Tools/PolygonProps";
import PropsProvider from "./props/Tools/PropsProvider";
import RectangleProps from "./props/Tools/RectangleProps";

const Tools = () => {
  const [editorMode, setEditorMode] = useState<
    ISpec.ShapesKey | "ruler" | null
  >(null);
  const shapesList: { key: ISpec.ShapesKey; Icon: LucideIcon }[] = [
    { key: "line", Icon: Slash },
    { key: "lines", Icon: ChevronUp },
    { key: "rectangle", Icon: Square },
    { key: "circle", Icon: Circle },
    { key: "polygon", Icon: Hexagon },
    { key: "arc", Icon: Parentheses },
  ];

  const { selection, clearSelection } = useSelectionStore();

  useEffect(() => {
    setEditorMode(selection ? selection.type : null);
  }, [selection]);

  const handleCloseEditor = () => {
    setEditorMode(null);
    clearSelection();
  };
  const propsComponents = {
    line: LineProps,
    lines: LinesProps,
    rectangle: RectangleProps,
    circle: CircleProps,
    polygon: PolygonProps,
    arc: ArcProps,
    ruler: RulerProps,
  };

  if (editorMode) {
    if (editorMode !== "ruler") {
      const Component = propsComponents[editorMode];
      return (
        <PropsProvider<ISpec.ShapesSpec>
          key={selection?.id}
          data={selection as ISpec.ShapesSpec}
          close={handleCloseEditor}
          shapeKey={editorMode}
        >
          {({ form }) => <Component form={form} />}
        </PropsProvider>
      );
    } else {
      return (
        <RulerProps
          key={selection?.id}
          close={handleCloseEditor}
          selection={selection}
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
              onClick={() => setEditorMode(key)}
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
          onClick={() => setEditorMode("ruler")}
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
