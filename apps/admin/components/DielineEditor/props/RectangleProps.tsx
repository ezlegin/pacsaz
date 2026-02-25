import {
  RectangleSpec,
  Shapes,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, ChevronLeft } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setShapeType: (val: keyof Shapes | null) => void;
  input: RectangleSpec;
  setInput: Dispatch<SetStateAction<RectangleSpec>>;
}

const RectangleSettings = ({ setShapeType, input, setInput }: Props) => {
  const {
    dielineSpec: { shapes },
    setShape,
  } = useDielineSpecStore();

  const addLine = () => {
    if (!input?.width || !input.height) return;

    const prevRects = shapes?.rectangle;
    const rectCount = prevRects ? Object.keys(prevRects).length : 0;
    const rectKey = `rect-${rectCount + 1}`;

    setShape("rectangle", rectKey, input);

    setShapeType(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.width && input.height) addLine();
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
          Rectangle
        </Button>

        <Button
          variant={"primaryForeground"}
          size={"icon"}
          type="submit"
          disabled={!input.width || !input.height}
        >
          <Check />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Width</Label>
        <Input
          autoFocus
          className="h-9 w-full"
          value={input.width}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, width: e.target.value }))
          }
          placeholder="e.g., width * 2"
        />
      </div>
      <div className="space-y-1">
        <Label>Height</Label>
        <Input
          className="h-9 w-full"
          value={input.height}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, height: e.target.value }))
          }
          placeholder="e.g., width * 2"
        />
      </div>
    </form>
  );
};

export default RectangleSettings;
