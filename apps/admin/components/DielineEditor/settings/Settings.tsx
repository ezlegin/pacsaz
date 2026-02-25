import React from "react";
import { DimensionInput } from "./DimensionsInput";
import MaterialInput from "./MaterialInput";
import { materials } from "@repo/store/data/dieline";
import BleedInput from "./BleedInput";
import {
  DielineSettings,
  useDielineSettingsStore,
} from "@repo/store/dieline/dielineSettings.store";
import ThicknessInput from "./ThicknessInput";
import DimensionTypeInput from "./DimensionTypeInput";
import FormatInput from "./FormatInput";
import DielineDownloadButton from "./DielineDownloadButton";

export type SetSetting = <K extends keyof DielineSettings>(
  key: K,
  value: DielineSettings[K],
) => void;

const Settings = ({ isRendering }: { isRendering: boolean }) => {
  const {
    setSetting,
    settings: { bleed, dimension, dimensionType, format },
  } = useDielineSettingsStore();

  const MATERIALS = [materials["glossy-cardboard"], materials["b-flute"]];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {DIMENSIONS.map(({ key }) => (
          <DimensionInput
            key={key}
            label={key}
            min={30}
            dimKey={key}
            isRendering={isRendering}
            dimension={dimension}
            setSetting={setSetting}
          />
        ))}
      </div>

      <MaterialInput materials={MATERIALS} setSetting={setSetting} />

      <BleedInput bleedAmount={bleed} setSetting={setSetting} />

      <ThicknessInput isRendering={isRendering} materialsIncluded={MATERIALS} />

      <DimensionTypeInput
        dimensionType={dimensionType}
        dimensionsType={["inner", "outer", "manufacture"]}
        setSetting={setSetting}
      />

      <FormatInput format={format} setSetting={setSetting} />

      <DielineDownloadButton isRendering={isRendering} slug={"slug"} />
    </div>
  );
};

export default Settings;

const DIMENSIONS = [
  { key: "width" },
  { key: "length" },
  { key: "height" },
] as const;
