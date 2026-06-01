import { useLoading } from "@repo/lib/utils/useLoading";
import { MaterialValue } from "@repo/store/data/types";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  isRendering: boolean;
  materialsIncluded: MaterialValue[];
}
const ThicknessInput = ({ isRendering, materialsIncluded }: Props) => {
  const [localInput, setLocalInput] = useState<string | undefined>();

  const {
    setSetting,
    settings: { thickness },
  } = useDielineSettingsStore();

  const { min: mMinThick, max: mMaxThick } =
    getThicknessRange(materialsIncluded);

  const {
    startLoading: startMThicknessLoading,
    stopLoading: stopMThicknessLoading,
    isLoading: isMThicknessLoading,
  } = useLoading();

  const handleThicknessChange = (
    type: "inc" | "dec" | "custom",
    val: number,
  ) => {
    if (type !== "custom") {
      startMThicknessLoading();
      const newThickness = val + (type === "inc" ? 0.1 : -0.1);
      if (newThickness < mMinThick || newThickness > mMaxThick) return;
      setSetting("thickness", newThickness);
    } else {
      if (val < mMinThick) {
        setSetting("thickness", mMinThick);
        return;
      }
      if (val > mMaxThick) {
        setSetting("thickness", mMaxThick);
        return;
      }
      setSetting("thickness", val);
    }
  };

  useEffect(() => {
    if (isRendering === false) stopMThicknessLoading();
  }, [isRendering]);

  const disabledInputs = isRendering && isMThicknessLoading;

  return (
    <div>
      <div className={"relative"}>
        {isRendering && isMThicknessLoading && (
          <Spinner className="text-primary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-100" />
        )}
        <Input
          disabled={disabledInputs}
          dir="ltr"
          className="text-center"
          value={(localInput ?? thickness).toString()}
          onChange={(e) => {
            const val = e.target.value;

            if (/^\d*\.?\d*$/.test(val)) {
              setLocalInput(val);
            }
          }}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => {
            const val = e.target.value;
            setLocalInput(undefined);

            const num = parseFloat(val);
            if (!Number.isNaN(num)) {
              handleThicknessChange("custom", num);
            }
          }}
        />
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("dec", thickness)}
          disabled={thickness <= mMinThick || disabledInputs}
        >
          <Minus />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("inc", thickness)}
          disabled={thickness >= mMaxThick || disabledInputs}
        >
          <Plus />
        </Button>
      </div>
      <div className="text-xs text-slate-400 text-center w-full pt-1" dir="ltr">
        {mMinThick} ~ {mMaxThick} mm
      </div>
    </div>
  );
};

export default ThicknessInput;

function getThicknessRange(MATERIALS: MaterialValue[]) {
  const thicknesses = Object.values(MATERIALS).map(
    (material) => material.thickness,
  );

  return {
    min: Math.min(...thicknesses),
    max: Math.max(...thicknesses),
  };
}
