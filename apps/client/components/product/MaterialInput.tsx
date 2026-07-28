import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSetting } from "@repo/store/slices/dielineSettingsSlice";
import { MaterialKey } from "@repo/store/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";

const MaterialInput = () => {
  const { material, materials } = useAppSelector((s) => s.dielineSettings);
  const dispatch = useAppDispatch();

  const onSelectMaterial = (val: MaterialKey) => {
    const material = materials.find((m) => m.value === val);
    if (!material) throw new Error("Material not found. [MaterialInput]");

    dispatch(setSetting({ key: "material", value: material }));
    dispatch(setSetting({ key: "thickness", value: material.thickness }));
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
