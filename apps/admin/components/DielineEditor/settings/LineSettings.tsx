import {
  LineSpec,
  Shapes,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface Props {
  setShapeType: (val: keyof Shapes | null) => void;
}

const LineSettings = ({ setShapeType }: Props) => {
  const [input, setInput] = useState<LineSpec>({
    length: "",
  });
  const { dielineSpec, setDielineSpec } = useDielineSpecStore();

  const addLine = () => {
    if (!input?.length) return;

    const previousLines = dielineSpec?.shapes?.line;
    const lineCount = previousLines ? Object.keys(previousLines).length : 0;
    const lineKey = `line-${lineCount + 1}`;

    setDielineSpec("shapes", {
      line: {
        ...previousLines,
        [lineKey]: input,
      },
    });

    setShapeType(null);
  };

  const updateOrigin = (axis: "x" | "y", value: string) => {
    setInput((prev) => ({
      ...prev,
      origin: {
        x: axis === "x" ? value : prev.origin?.x || "0",
        y: axis === "y" ? value : prev.origin?.y || "0",
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button
          variant={"ghost"}
          onClick={() => setShapeType(null)}
          className="has-[>svg]:px-0"
        >
          <ChevronLeft />
          Line
        </Button>

        <Button
          variant={"primaryForeground"}
          size={"icon"}
          onClick={addLine}
          disabled={!input.length}
        >
          <Check />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Length</Label>
        <Input
          className="h-9 w-full"
          value={input.length}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, length: e.target.value }))
          }
          placeholder="e.g., width * 2"
        />
      </div>

      <div className="space-y-1">
        <Label>Angle (optional)</Label>
        <Input
          type="number"
          className="h-9 w-full"
          value={input.angle ?? ""}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              angle: e.target.value ? +e.target.value : undefined,
            }))
          }
          placeholder="0"
        />
      </div>

      <div className="space-y-1">
        <Label>Origin (optional)</Label>
        <div className="flex justify-between gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              className="h-9 w-full"
              value={input.origin?.x || ""}
              onChange={(e) => updateOrigin("x", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              className="h-9 w-full"
              value={input.origin?.y || ""}
              onChange={(e) => updateOrigin("y", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineSettings;
