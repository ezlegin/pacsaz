import {
  LineSpec,
  Shapes,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Check, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface Props {
  setShapeType: (val: keyof Shapes | null) => void;
}

const LineSettings = ({ setShapeType }: Props) => {
  const [input, setInput] = useState<LineSpec>({
    length: "",
    layer: "trim",
  });
  const {
    dielineSpec: { shapes },
    setShape,
  } = useDielineSpecStore();

  const addLine = () => {
    if (!input?.length) return;

    const prevLines = shapes?.line;
    const xx = Object.entries(prevLines ?? {})
      .map(([key]) => key)
      .at(-1)
      ?.split("-")[1];

    const lineCount = xx ? +xx + 1 : "1";
    const lineKey = `line-${lineCount}`;

    setShape("line", lineKey, input);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length) addLine();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between">
        <Button
          variant={"ghost"}
          onClick={() => setShapeType(null)}
          className="has-[>svg]:px-0"
          type="button"
        >
          <ChevronLeft />
          Line
        </Button>

        <Button
          variant={"primaryForeground"}
          size={"icon"}
          type="submit"
          disabled={!input.length}
        >
          <Check />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Length</Label>
        <Input
          autoFocus
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

      <div className="space-y-1">
        <Label>Layer</Label>
        <ToggleGroup
          defaultValue="trim"
          onValueChange={(val: "trim" | "fold" | "perf") =>
            setInput((prev) => ({ ...prev, layer: val }))
          }
          variant="outline"
          type="single"
          size={"sm"}
        >
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer"
            value="trim"
          >
            Trim
          </ToggleGroupItem>
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer"
            value="fold"
          >
            Fold
          </ToggleGroupItem>
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer"
            value="perf"
          >
            Perf
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </form>
  );
};

export default LineSettings;
