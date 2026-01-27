import { DielineMaterials } from "@repo/dieline-core/data/types";
import { MaterialKey } from "@repo/store/data/types";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { calculateSafeFoldOffset } from "../../../../packages/store/src/utils/calculateSafeFoldOffset";
import { materials } from "@repo/store/data/dieline";

const MaterialInput = ({
  materialsInput,
}: {
  materialsInput: DielineMaterials;
}) => {
  const { setSetting } = useDielineSettingsStore();

  const onSelectMaterial = (val: string) => {
    const material = materialsInput.included.find((m) => m.value === val)
      ?.value as MaterialKey;

    const thickness = materials[material].thickness;

    setSetting("material", materials[material]);
    setSetting("thickness", thickness);
    setSetting("safeFoldOffset", calculateSafeFoldOffset(thickness));
  };

  return (
    <Select
      onValueChange={onSelectMaterial}
      dir="rtl"
      defaultValue={materialsInput.default.value}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="انتخاب متریال" />
      </SelectTrigger>

      <SelectContent position="popper">
        {materialsInput.included.map((item) => (
          <SelectItem className="py-2.5" key={item.value} value={item.value}>
            <span
              className={cn(
                item.value === "glossy-cardboard" || item.value === "art-paper"
                  ? "bg-white"
                  : "bg-orange-100",
                `size-5 rounded-full border`
              )}
            />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MaterialInput;
