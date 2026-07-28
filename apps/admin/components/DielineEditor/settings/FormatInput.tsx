import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import React from "react";
import { SetSetting } from "./Settings";
import Image from "next/image";
import { pdfIcon, aiIcon, dxfIcon } from "@/public";
import { Format } from "@repo/store/types";

const FormatInput = ({
  setSetting,
  format,
}: {
  format: Format;
  setSetting: SetSetting;
}) => {
  return (
    <ToggleGroup
      type="single"
      size="lg"
      dir="rtl"
      variant="outline"
      spacing={1}
      value={format}
      onValueChange={(val) => {
        if (val) setSetting("format", val as Format);
      }}
      className="w-full"
    >
      <div className="grid grid-cols-3 w-full gap-2">
        {FORMATS.map(({ value, icon }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="cursor-pointer data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="pt-1 text-muted-foreground">{value}</span>
              <Image src={icon} alt={value} width={20} height={22} />
            </div>
          </ToggleGroupItem>
        ))}
      </div>
    </ToggleGroup>
  );
};

export default FormatInput;

const FORMATS = [
  { value: "pdf", icon: pdfIcon },
  { value: "ai", icon: aiIcon },
  { value: "dxf", icon: dxfIcon },
] as const;
