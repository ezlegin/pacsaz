import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Shapes, ShapesKey } from "./Settings";

interface Props {
  setShapeType: (val: ShapesKey | null) => void;
  setShapes: React.Dispatch<React.SetStateAction<Shapes>>;
}

const LineSettings = ({ setShapeType, setShapes }: Props) => {
  const [input, setInput] = useState<{
    length: string;
  }>({
    length: "",
  });

  const addLine = () => {
    setShapes((prev) => {
      const lineCount = prev.line ? Object.keys(prev.line).length : 0;
      const lineKey = `line-${lineCount + 1}`;
      return {
        ...prev,
        line: {
          ...prev.line,
          [lineKey]: {
            length: input.length,
          },
        },
      };
    });

    setShapeType(null);
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

        <Button variant={"primaryForeground"} size={"icon"} onClick={addLine}>
          <Check />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Length</Label>
        <div className="flex gap-3">
          <Input
            className="h-9 w-full"
            value={input.length}
            onChange={(e) =>
              setInput((pre) => ({ ...pre, length: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LineSettings;
