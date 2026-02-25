import { MaterialKey, MaterialValue } from "@repo/store/data/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { SetSetting } from "./Settings";

const MaterialInput = ({
  materials,
  setSetting,
}: {
  materials: MaterialValue[];
  setSetting: SetSetting;
}) => {
  const onSelectMaterial = (val: MaterialKey) => {
    const material = materials.find((m) => m.value === val);
    if (!material) throw new Error("Material not found. [MaterialInput]");

    setSetting("material", material);
    setSetting("thickness", material.thickness);
  };

  return (
    <Select onValueChange={onSelectMaterial} defaultValue={materials[0]!.value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="انتخاب متریال" />
      </SelectTrigger>

      <SelectContent position="popper">
        {materials.map((item) => (
          <SelectItem className="py-2.5" key={item.value} value={item.value}>
            <span
              className={cn(
                item.value === "glossy-cardboard" || item.value === "art-paper"
                  ? "bg-white"
                  : "bg-orange-100",
                `size-5 rounded-full border`,
              )}
            />
            {item.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MaterialInput;
