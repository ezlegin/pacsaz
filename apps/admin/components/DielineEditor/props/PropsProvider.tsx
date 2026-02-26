import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  LineSpec,
  RectangleSpec,
  ShapesKey,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Check, ChevronLeft } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface PropsProvider<T> {
  initialData: T;
  children: (props: {
    input: T;
    setInput: Dispatch<SetStateAction<T>>;
  }) => ReactNode;
  close: () => void;
  shapeKey: ShapesKey;
}

function PropsProvider<T extends LineSpec | RectangleSpec>({
  children,
  initialData,
  close,
  shapeKey,
}: PropsProvider<T>) {
  const {
    dielineSpec: { shapes },
    setShape,
    updateShape,
  } = useDielineSpecStore();
  const { selectedShape } = useSelectShapeStore();
  const [input, setInput] = useState<T>(initialData);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedShape) {
      updateShape(selectedShape.parent, selectedShape.child, input);
    } else {
      const prevLines = shapes?.line;
      const lastKey = Object.entries(prevLines ?? {})
        .map(([key]) => key)
        .at(-1)
        ?.split("-")[1];

      const lineCount = lastKey ? +lastKey + 1 : "1";
      const lineKey = `line-${lineCount}`;

      setShape(shapeKey, lineKey, input);

      close();
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="flex justify-between">
          <Button
            variant={"ghost"}
            onClick={() => close()}
            className="has-[>svg]:px-0 capitalize"
            type="button"
          >
            <ChevronLeft />
            Line
          </Button>

          <Button variant={"primaryForeground"} size={"icon"} type="submit">
            <Check />
          </Button>
        </div>

        {children({ input, setInput })}
      </form>

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
          className="w-full"
        >
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer w-1/3"
            value="trim"
          >
            <div className="text-blue-500">Trim</div>
          </ToggleGroupItem>
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer w-1/3"
            value="fold"
          >
            <div className="text-red-500">Fold</div>
          </ToggleGroupItem>
          <ToggleGroupItem
            className="data-[state=on]:bg-gray-200 cursor-pointer w-1/3"
            value="perf"
          >
            <div className="text-fuchsia-500">Perf</div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

export default PropsProvider;
