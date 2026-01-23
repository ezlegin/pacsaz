import { useLoading } from "@/hooks/useLoading";
import { isSubscribed } from "@repo/dieline-core/data/consts";
import { MaterialValue } from "@repo/dieline-core/data/types";
import { useMaterialStore } from "@repo/dieline-core/store/material.store";
import { useThicknessStore } from "@repo/dieline-core/store/thickness.store";
import { formatToFixed } from "@repo/dieline-core/utils/format";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  isRendering: boolean;
  materialsIncluded: MaterialValue[];
}
const ThicknessInput = ({ isRendering, materialsIncluded }: Props) => {
  const [localCustomThickness, setLocalCustomThickness] = useState<
    string | undefined
  >();

  const { material } = useMaterialStore();
  const { setCustomThickness, thickness, getThicknessRange, setThickness } =
    useThicknessStore();
  const { min: mMinThick, max: mMaxThick } =
    getThicknessRange(materialsIncluded);

  const {
    startLoading: startMThicknessLoading,
    stopLoading: stopMThicknessLoading,
    isLoading: isMThicknessLoading,
  } = useLoading();

  useEffect(() => {
    setThickness(material.thickness);
    setLocalCustomThickness(material.thickness.toFixed(1));
    setCustomThickness(undefined);
  }, [material]);

  const handleThicknessChange = (type: "inc" | "dec") => {
    startMThicknessLoading();

    const thickness = localCustomThickness ?? material.thickness;

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
      {thickness}
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
          value={formatToFixed(localCustomThickness ?? thickness.toString())}
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
            (+(localCustomThickness ?? 0) || material.thickness) <= mMinThick
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
            (+(localCustomThickness ?? 0) || material.thickness) >= mMaxThick
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
