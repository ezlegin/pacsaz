import {
  DielineSettings,
  useDielineSettingsStore,
} from "@repo/store/dieline/dielineSettings.store";
import BleedInput from "./BleedInput";
import DielineDownloadButton from "./DielineDownloadButton";
import { DimensionInput } from "./DimensionsInput";
import DimensionTypeInput from "./DimensionTypeInput";
import FormatInput from "./FormatInput";
import MaterialInput from "./MaterialInput";
import ThicknessInput from "./ThicknessInput";

export type SetSetting = <K extends keyof DielineSettings>(
  key: K,
  value: DielineSettings[K],
) => void;

const Settings = ({ isRendering }: { isRendering: boolean }) => {
  const {
    setSetting,
    settings: {
      bleed,
      dimension,
      dimensionType,
      format,
      materials,
      dimensionTypes,
    },
  } = useDielineSettingsStore();

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

      <MaterialInput materials={materials} setSetting={setSetting} />

      <BleedInput bleedAmount={bleed} setSetting={setSetting} />

      <ThicknessInput isRendering={isRendering} materialsIncluded={materials} />

      <DimensionTypeInput
        dimensionType={dimensionType}
        dimensionsType={dimensionTypes}
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
