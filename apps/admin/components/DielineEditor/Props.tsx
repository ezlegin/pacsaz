"use client";

import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { Label } from "@repo/ui/components/label";
import {
  ChevronUp,
  Circle,
  LucideIcon,
  PlusCircle,
  Slash,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import CircleProps from "./props/CircleProps";
import LineProps from "./props/LineProps";
import LinesProps from "./props/LinesProps";
import PropsProvider from "./props/PropsProvider";
import RectangleProps from "./props/RectangleProps";

const Props = () => {
  const [editorMode, setEditorMode] = useState<ISpec.ShapesKey | null>(null);
  const shapesList: { key: ISpec.ShapesKey; Icon: LucideIcon }[] = [
    { key: "line", Icon: Slash },
    { key: "lines", Icon: ChevronUp },
    { key: "rectangle", Icon: Square },
    { key: "circle", Icon: Circle },
  ];

  const { selectedShape, clearSelection } = useSelectShapeStore();

  useEffect(() => {
    setEditorMode(selectedShape ? selectedShape.type : null);
  }, [selectedShape]);

  const handleCloseEditor = () => {
    setEditorMode(null);
    clearSelection();
  };
  if (editorMode) {
    const propsComponents = {
      line: LineProps,
      lines: LinesProps,
      rectangle: RectangleProps,
      circle: CircleProps,
    };

    const Component = propsComponents[editorMode];
    return (
      <PropsProvider<ISpec.ShapesSpec>
        key={`${selectedShape?.type} ${selectedShape?.key}`}
        data={selectedShape}
        close={handleCloseEditor}
        shapeKey={editorMode}
      >
        {({ form }) => <Component form={form} />}
      </PropsProvider>
    );
  }

  return shapesList.map(({ Icon, key }, idx) => (
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
  ));
};

export default Props;
