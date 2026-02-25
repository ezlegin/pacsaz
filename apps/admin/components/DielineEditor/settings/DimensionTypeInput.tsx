import { DimensionType } from "@repo/store/data/types";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import React from "react";
import { SetSetting } from "./Settings";
import { DimensionsType } from "@repo/dieline-core/data/types";

const DimensionTypeInput = ({
  dimensionsType,
  dimensionType,
  setSetting,
}: {
  dimensionsType: DimensionsType;
  dimensionType: DimensionType;
  setSetting: SetSetting;
}) => {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="lg"
      defaultValue="manufacture"
      spacing={2}
      dir="rtl"
      value={dimensionType}
      onValueChange={(val) => {
        if (val) setSetting("dimensionType", val as DimensionType);
      }}
      className="w-full"
    >
      <div className="grid grid-cols-3 w-full gap-2">
        {DIMENSIONS_TYPE.map(
          ({ key }) =>
            dimensionsType.includes(key) && (
              <ToggleGroupItem
                key={key}
                value={key}
                className="cursor-pointer data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
              >
                <p className="font-normal text-xs">{key.slice(0, 5)}</p>
              </ToggleGroupItem>
            ),
        )}
      </div>
    </ToggleGroup>
  );
};

export default DimensionTypeInput;

const DIMENSIONS_TYPE = [
  { key: "outer" },
  { key: "inner" },
  { key: "manufacture" },
] as const;
