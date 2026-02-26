import { LineSpec } from "@repo/store/dieline/dielineSpec.store";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Dispatch, SetStateAction } from "react";

interface Props {
  input: LineSpec;
  setInput: Dispatch<SetStateAction<LineSpec>>;
}

const LineProps = ({ input, setInput }: Props) => {
  const updateOrigin = (
    setInput: React.Dispatch<React.SetStateAction<LineSpec>>,
    axis: "x" | "y",
    value: string,
  ) => {
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
              onChange={(e) => updateOrigin(setInput, "x", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              className="h-9 w-full"
              value={input.origin?.y || ""}
              onChange={(e) => updateOrigin(setInput, "y", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineProps;
