import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ReactNode, useState } from "react";

interface PropsProvider<T> {
  initialData: T;
  children: (props: {
    input: T;
    setInput: React.Dispatch<React.SetStateAction<T>>;
  }) => ReactNode;
}

function PropsProvider<T extends { layer: "trim" | "fold" | "perf" }>({
  children,
  initialData,
}: PropsProvider<T>) {
  const [input, setInput] = useState<T>(initialData);

  return (
    <div className="space-y-3">
      {children({ input, setInput })}
      <div className="space-y-1">
        <Label>Layer</Label>
        <ToggleGroup
          value={input.layer}
          onValueChange={(val: "trim" | "fold" | "perf") => {
            if (val) {
              setInput((prev) => ({ ...prev, layer: val }));
            }
          }}
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
    </div>
  );
}

export default PropsProvider;
