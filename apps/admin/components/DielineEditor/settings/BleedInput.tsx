import { bleeds as BLEEDS } from "@repo/store/data/dieline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { SetSetting } from "./Settings";

const BleedInput = ({
  bleedAmount,
  setSetting,
}: {
  bleedAmount: number;
  setSetting: SetSetting;
}) => {
  return (
    <Select
      defaultValue={String(bleedAmount)}
      onValueChange={(val: string) => setSetting("bleed", +val)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="انتخاب بلید" />
      </SelectTrigger>

      <SelectContent position="popper">
        {bleeds.map((item) => (
          <SelectItem
            className="py-2.5"
            key={item.type}
            value={item.size.toString()}
          >
            <span dir="ltr">{item.size} mm</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BleedInput;

const bleeds = Object.entries(BLEEDS).map(([type, size]) => ({
  type,
  size,
}));
