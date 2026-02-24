"use client";

import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import LineSettings from "./LineSettings";

export type Shapes = Partial<{
  line: Record<string, { length: string }>;
}>;
export type ShapesKey = keyof Shapes;

const Settings = () => {
  const [shapeType, setShapeType] = useState<ShapesKey | null>(null);
  const [shapes, setShapes] = useState<Shapes>({ line: {} });

  switch (shapeType) {
    case "line":
      return <LineSettings setShapeType={setShapeType} setShapes={setShapes} />;
    default:
      return (
        <div>
          <div className="flex justify-between items-center">
            <Label>Lines</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShapeType("line")}
            >
              <PlusCircle />
            </Button>
          </div>
          {JSON.stringify(shapes)}
        </div>
      );
  }
};

export default Settings;
