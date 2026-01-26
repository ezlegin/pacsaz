import { useLoading } from "@/hooks/useLoading";
import { getThicknessRange } from "@/utils/getThicknessRange";
import { useUserStore } from "@repo/store/app/user.store";
import { MaterialValue } from "@repo/store/data/types";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";

interface Props {
  isRendering: boolean;
  materialsIncluded: MaterialValue[];
}
const ThicknessInput = ({ isRendering, materialsIncluded }: Props) => {
  const { isPremium } = useUserStore();

  const {
    setSetting,
    settings: { thickness, material },
  } = useDielineSettingsStore();

  const { min: mMinThick, max: mMaxThick } =
    getThicknessRange(materialsIncluded);

  const {
    startLoading: startMThicknessLoading,
    stopLoading: stopMThicknessLoading,
    isLoading: isMThicknessLoading,
  } = useLoading();

  useEffect(() => {
    setSetting("thickness", material.thickness);
  }, [material]);

  const handleThicknessChange = (type: "inc" | "dec") => {
    startMThicknessLoading();

    const newThickness = +thickness + (type === "inc" ? 0.1 : -0.1);

    if (+newThickness < mMinThick || +newThickness > mMaxThick) return;

    setSetting("thickness", newThickness);
  };

  useEffect(() => {
    if (isRendering === false) stopMThicknessLoading();
  }, [isRendering]);

  const disabledInputs = isRendering && isMThicknessLoading;

  return (
    <div>
      <div className={cn(!isPremium && "cursor-not-allowed", "relative")}>
        {isRendering && isMThicknessLoading && (
          <Spinner className="text-primary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-100" />
        )}
        <Input
          disabled={!isPremium || disabledInputs}
          dir="ltr"
          defaultValue={thickness.toString()}
          className="text-center"
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => {
            const val = e.target.value;

            if (+val < mMinThick) {
              setSetting("thickness", mMinThick);
              return;
            }
            if (+val > mMaxThick) {
              setSetting("thickness", mMaxThick);
              return;
            }

            setSetting("thickness", +val);
          }}
        />
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("dec")}
          disabled={thickness <= mMinThick || !isPremium || disabledInputs}
        >
          <Minus />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("inc")}
          disabled={thickness >= mMaxThick || !isPremium || disabledInputs}
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
