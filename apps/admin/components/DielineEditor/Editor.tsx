"use client";

import { Shapes } from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import LineSettings from "./props/LineProps";
import RectangleSettings from "./props/RectangleProps";

const Editor = () => {
  const [shapeType, setShapeType] = useState<keyof Shapes | null>(null);

  switch (shapeType) {
    case "line":
      return <LineSettings setShapeType={setShapeType} />;
    case "rectangle":
      return <RectangleSettings setShapeType={setShapeType} />;
    default:
      return (
        <div>
          <div className="flex justify-between items-center">
            <Label>Line</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShapeType("line")}
            >
              <PlusCircle />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <Label>Rectangle</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShapeType("rectangle")}
            >
              <PlusCircle />
            </Button>
          </div>
        </div>
      );
  }
};

export default Editor;
