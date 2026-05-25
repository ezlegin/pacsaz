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

const MaterialInput = () => {
  const {
    setSetting,
    settings: { materials, material },
  } = useDielineSettingsStore();

  const onSelectMaterial = (val: MaterialKey) => {
    const material = materials.find((m) => m.value === val);
    if (!material) throw new Error("Material not found. [MaterialInput]");

    setSetting("material", material);
    setSetting("thickness", material.thickness);
  };

  return (
    <Select onValueChange={onSelectMaterial} dir="rtl" value={material.value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="انتخاب متریال" />
      </SelectTrigger>

      <SelectContent position="popper">
        {materials.map((item) => (
          <SelectItem className="py-2.5" key={item.value} value={item.value}>
            <span
              className={cn(
                item.value === "glossyCardboard" || item.value === "artPaper"
                  ? "bg-white"
                  : "bg-orange-100",
                `size-5 rounded-full border`,
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
