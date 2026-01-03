import { useLoading } from "@/hooks/useLoading";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { formatToFixed } from "@/lib/dielines/core/helpers/format";
import { getThicknessRange } from "@/lib/dielines/core/helpers/getThicknessRange";
import { MaterialValue } from "@/lib/dielines/core/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import React, { useEffect } from "react";

interface Props {
  localCustomThickness: string | undefined;
  selectedMaterialThickness: number;
  setLocalCustomThickness: (val: string) => void;
  setCustomThickness: (val: number) => void;
  isRendering: boolean;
  materialsIncluded: MaterialValue[];
}
const ThicknessInput = ({
  selectedMaterialThickness,
  localCustomThickness,
  setLocalCustomThickness,
  setCustomThickness,
  isRendering,
  materialsIncluded,
}: Props) => {
  const { min: mMinThick, max: mMaxThick } =
    getThicknessRange(materialsIncluded);

  const {
    startLoading: startMThicknessLoading,
    stopLoading: stopMThicknessLoading,
    isLoading: isMThicknessLoading,
  } = useLoading();

  const handleThicknessChange = (type: "inc" | "dec") => {
    startMThicknessLoading();

    const thickness = localCustomThickness ?? selectedMaterialThickness;

    const newThickness = +thickness + (type === "inc" ? 0.1 : -0.1);

    if (+newThickness < mMinThick || +newThickness > mMaxThick) return;

    setLocalCustomThickness(newThickness.toString());
    setCustomThickness(+newThickness);
  };

  useEffect(() => {
    if (isRendering === false) stopMThicknessLoading();
  }, [isRendering]);

  return (
    <div>
      <div
        className={cn(
          isRendering &&
            isMThicknessLoading &&
            "opacity-50 pointer-events-none",
          !isSubscribed && "pointer-events-none opacity-40",
          "relative"
        )}
      >
        {isRendering && isMThicknessLoading && (
          <Spinner className="text-primary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-100" />
        )}
        <Input
          dir="ltr"
          value={formatToFixed(
            localCustomThickness ?? selectedMaterialThickness.toString()
          )}
          className={"text-center"}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const val = e.target.value;
            if (!/^\d*\.?\d*$/.test(val)) return;

            setLocalCustomThickness(val);
          }}
          onBlur={(e) => {
            const val = e.target.value;

            if (+val < mMinThick) {
              setLocalCustomThickness(mMinThick.toString());
              setCustomThickness(mMinThick);
              return;
            }
            if (+val > mMaxThick) {
              setLocalCustomThickness(mMaxThick.toString());
              setCustomThickness(mMaxThick);
              return;
            }

            setLocalCustomThickness(val);
            setCustomThickness(+val);
          }}
        />
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("dec")}
          disabled={
            (+(localCustomThickness ?? 0) || selectedMaterialThickness) <=
            mMinThick
          }
        >
          <Minus />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => handleThicknessChange("inc")}
          disabled={
            (+(localCustomThickness ?? 0) || selectedMaterialThickness) >=
            mMaxThick
          }
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
