import { RectangleSpec } from "@repo/store/dieline/dielineSpec.store";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Dispatch, SetStateAction } from "react";

interface Props {
  input: RectangleSpec;
  setInput: Dispatch<SetStateAction<RectangleSpec>>;
}

const RectangleProps = ({ input, setInput }: Props) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default RectangleProps;
