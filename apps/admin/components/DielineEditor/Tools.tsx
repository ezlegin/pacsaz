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
  Package,
  Parentheses,
  PlusCircle,
  Ruler,
  Slash,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import RulerProps from "./props/RulerProps";
import GroupsPropsProvider from "./props/GroupsPropsProvider";
import ModelsPropsProvider from "./props/ModelsPropsProvider";
import ShapesPropsProvider from "./props/ShapesPropsProvider";
import ArcProps from "./props/shapes/ArcProps";
import CircleProps from "./props/shapes/CircleProps";
import LineProps from "./props/shapes/LineProps";
import LinesProps from "./props/shapes/LinesProps";
import PolygonProps from "./props/shapes/PolygonProps";
import RectangleProps from "./props/shapes/RectangleProps";
import { defaultModelValues, modelLabels } from "@/lib/models/registry";

type EditorMode = {
  stack: ISpec.Stack;
  key: ISpec.ShapesKey | ISpec.ModelKey | "ruler" | "group";
};

const MODEL_ICON = Package;

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

  // One shared icon for every model — they are told apart by name.
  const modelsList: ISpec.ModelKey[] = ["glue", "door", "hole", "snapLock"];

  const selection = useAppSelector((s) => s.selection.selection);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const current = selection;
    if (!current) {
      setEditorMode(null);
      return;
    }

    // `stack` is a union on shapes and rulers, so the panel is chosen from `type`.
    if (current.type === "model") {
      setEditorMode({ stack: "model", key: current.modelKey });
      return;
    }
    if (current.type === "group") {
      setEditorMode({ stack: "group", key: "group" });
      return;
    }
    if (current.type === "ruler") {
      setEditorMode({ stack: "ruler", key: "ruler" });
      return;
    }

    setEditorMode({ stack: "shape", key: current.type });
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

    if (editorMode.stack === "model") {
      const modelKey = editorMode.key as ISpec.ModelKey;
      const editing =
        selection?.type === "model" ? (selection as ISpec.Model) : null;

      return (
        <ModelsPropsProvider
          key={selection?.id ?? `new-${modelKey}`}
          data={editing}
          modelKey={modelKey}
          initialValues={defaultModelValues(modelKey)}
          close={handleCloseEditor}
        />
      );
    }

    if (editorMode.stack === "group") {
      return (
        <GroupsPropsProvider
          key={selection?.id}
          data={selection as ISpec.Group}
          close={handleCloseEditor}
        />
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
        <Label>Models</Label>
        <div>
          {modelsList.map((key) => (
            <div
              key={key}
              className="flex justify-between items-center hover:bg-gray-200/50 cursor-pointer px-2 py-2.5 rounded-md group"
              onClick={() => setEditorMode({ stack: "model", key })}
            >
              <Label className="capitalize cursor-pointer">
                <MODEL_ICON
                  size={14}
                  className="text-muted-foreground group-hover:text-foreground"
                />
                {modelLabels[key]}
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
