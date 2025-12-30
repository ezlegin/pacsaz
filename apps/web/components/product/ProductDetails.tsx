import { useLoading } from "@/hooks/useLoading";
import { clamp } from "@/hooks/useSize";
import { downloadPdf } from "@/lib/actions/export/downloader";
import {
  BLEED,
  DIMENSIONS,
  DIMENSIONS_TYPE,
  FORMATS,
  MaterialKey,
  MATERIALS,
} from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { getThicknessRange } from "@/lib/dielines/core/helpers/getThicknessRange";
import {
  DielineDimensions,
  DimensionKey,
  DimensionsType,
  FormatsType,
  MaterialsInput,
  Model,
} from "@/lib/dielines/core/types";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { toast } from "@workspace/ui/index";
import { cn } from "@workspace/ui/lib/utils";
import { Info, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { JSX, useEffect, useState } from "react";
import DielineDownloadButton from "./DielineDownloadButton";
import DimensionInfo from "./info/DimensionInfo";
import { formatToFixed } from "@/lib/dielines/core/helpers/format";

export interface SVGSizeProps {
  width: number;
  length: number;
}

interface Props {
  defaultDimensions: DielineDimensions;
  materials: MaterialsInput;
  dimensionsType: DimensionsType;
  setDimension: (key: DimensionKey, value: number) => void;
  setMaterial: (mat: MaterialKey) => void;
  setDimensionType: (value: DimensionType) => void;
  setBleedAmount: (value: number) => void;
  setCustomThickness: (value: number | undefined) => void;
  dimensionType: DimensionType;
  svg: Model | null;
  slug: string;
  material: MaterialKey;
  isRendering: boolean;
}

export default function ProductDetails({
  defaultDimensions,
  setDimension,
  setDimensionType,
  setMaterial,
  setBleedAmount,
  setCustomThickness,
  dimensionType,
  dimensionsType,
  svg,
  slug,
  materials,
  material,
  isRendering,
}: Props) {
  const [format, setFormat] = useState<FormatsType>("pdf");

  const { startLoading, stopLoading, isLoading } = useLoading();
  const {
    startLoading: startMThicknessLoading,
    stopLoading: stopMThicknessLoading,
    isLoading: isMThicknessLoading,
  } = useLoading();

  const onDownload = async () => {
    if (!svg) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }
    startLoading();

    await downloadPdf({
      svg,
      format,
      slug,
    });

    stopLoading();
  };

  const onSelectMaterial = (val: string) => {
    const material = materials.included.find((m) => m.value === val)
      ?.value as MaterialKey;

    if (!material) return;

    setMaterial(material);
  };

  const selectedMaterial = MATERIALS[material];

  const [localCustomThickness, setLocalCustomThickness] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!localCustomThickness) return;

    setCustomThickness(undefined);
    setLocalCustomThickness(selectedMaterial?.thickness.toFixed());
  }, [selectedMaterial]);

  const bleeds = Object.entries(BLEED).map(([type, size]) => ({
    type,
    size,
  }));

  const slateColors = [
    "bg-slate-300",
    "bg-slate-400",
    "bg-slate-500",
    "bg-slate-600",
    "bg-slate-700",
  ];

  const { min: mMinThick, max: mMaxThick } = getThicknessRange(
    materials.included
  );

  const handleThicknessChange = (type: "inc" | "dec") => {
    startMThicknessLoading();

    const thickness = localCustomThickness ?? selectedMaterial?.thickness;

    const newThickness = +thickness + (type === "inc" ? 0.1 : -0.1);

    if (+newThickness < mMinThick || +newThickness > mMaxThick) return;

    setLocalCustomThickness(newThickness.toString());
    setCustomThickness(+newThickness);
  };

  useEffect(() => {
    if (isRendering === false) stopMThicknessLoading();
  }, [isRendering]);

  return (
    <div className="h-full z-10">
      <Card className="h-full flex flex-col justify-between overflow-y-auto bg-white p-6 ">
        <div className="space-y-8">
          <Section title="ابعاد" infoContent={<DimensionInfo />}>
            <div className="grid grid-cols-2 gap-4">
              {DIMENSIONS.map(({ key, label }) => (
                <DimensionInput
                  key={key}
                  label={label}
                  value={defaultDimensions.defaultDimensions[key]}
                  min={defaultDimensions.minDimensions[key]}
                  onChange={(value) => setDimension(key, value)}
                  dimKey={key}
                  isRendering={isRendering}
                />
              ))}
            </div>
          </Section>

          <Section title="متریال چاپ" infoContent={<DimensionInfo />}>
            <Select
              onValueChange={onSelectMaterial}
              dir="rtl"
              defaultValue={materials.default.value}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب متریال" />
              </SelectTrigger>

              <SelectContent position="popper">
                {materials.included.map((item) => (
                  <SelectItem
                    className="py-2.5"
                    key={item.value}
                    value={item.value}
                  >
                    <span
                      className={`h-5 w-5 rounded-full border ${item.color}`}
                    />
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Section>

          <Section
            isPremium
            title="اندازه بلید"
            infoContent={<DimensionInfo />}
          >
            <Select
              onValueChange={(val: string) => setBleedAmount(+val)}
              dir="rtl"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب بلید" />
              </SelectTrigger>

              <SelectContent position="popper">
                {bleeds.map((item, idx) => (
                  <SelectItem
                    className="py-2.5"
                    key={item.type}
                    value={item.size.toString()}
                  >
                    <div
                      className={`${slateColors[idx]} * 100} w-5`}
                      style={{ height: `${idx + 3}px` }}
                    />
                    <span dir="ltr">{item.size} mm</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Section>

          <Section isPremium title="ضخامت" infoContent={<DimensionInfo />}>
            <div>
              <div
                className={cn(
                  isRendering &&
                    isMThicknessLoading &&
                    "opacity-50 pointer-events-none",
                  "relative"
                )}
              >
                {isRendering && isMThicknessLoading && (
                  <Spinner className="text-primary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-100" />
                )}
                <Input
                  dir="ltr"
                  value={formatToFixed(
                    localCustomThickness ??
                      selectedMaterial?.thickness.toString()
                  )}
                  className="text-center"
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
                    (+(localCustomThickness ?? 0) ||
                      selectedMaterial.thickness) <= mMinThick
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
                    (+(localCustomThickness ?? 0) ||
                      selectedMaterial.thickness) >= mMaxThick
                  }
                >
                  <Plus />
                </Button>
              </div>
              <div
                className="text-xs text-slate-400 text-center w-full pt-1"
                dir="ltr"
              >
                {mMinThick} ~ {mMaxThick} mm
              </div>
            </div>
          </Section>

          <Section title="نوع ابعاد" infoContent={<DimensionInfo />}>
            <ToggleGroup
              type="single"
              variant="outline"
              size="lg"
              defaultValue="manufacture"
              spacing={2}
              dir="rtl"
              value={dimensionType}
              onValueChange={(val) => {
                if (val) setDimensionType(val as DimensionType);
              }}
            >
              {DIMENSIONS_TYPE.map(
                ({ label, key }) =>
                  dimensionsType.includes(key) && (
                    <ToggleGroupItem
                      key={key}
                      value={key}
                      className="border-2 cursor-pointer data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
                    >
                      <p className="font-normal text-xs">{label}</p>
                    </ToggleGroupItem>
                  )
              )}
            </ToggleGroup>
          </Section>
        </div>

        <div>
          <Section title="فرمت" infoContent={<DimensionInfo />}>
            <ToggleGroup
              type="single"
              size="lg"
              dir="rtl"
              variant="outline"
              spacing={2}
              value={format}
              onValueChange={(val) => {
                if (val) setFormat(val as FormatsType);
              }}
            >
              {FORMATS.map(({ value, icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="border-2 cursor-pointer w-1/3 data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="pt-1 text-muted-foreground">{value}</span>
                    <Image src={icon} alt={value} width={20} height={22} />
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <DielineDownloadButton
              disabled={isRendering || isLoading}
              loading={isLoading}
              download={onDownload}
            />
          </Section>
        </div>
      </Card>
    </div>
  );
}

function Section({
  title,
  children,
  infoContent,
  isPremium,
  className,
}: {
  title: string;
  infoContent: JSX.Element;
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between">
        <p className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <Dialog>
            <DialogTrigger dir="rtl">
              <Info
                size={14}
                className="text-muted-foreground cursor-pointer hover:text-primary"
              />
            </DialogTrigger>
            <DialogContent dir="rtl" showCloseButton={false}>
              <DialogHeader dir="rtl">{infoContent}</DialogHeader>
            </DialogContent>
          </Dialog>
        </p>

        {isPremium && (
          <div>
            <Diamond />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function DimensionInput({
  label,
  value,
  min,
  onChange,
  dimKey,
  isRendering,
}: {
  label: string;
  value: number;
  min: number;
  dimKey: DimensionKey;
  onChange: (value: number) => void;
  isRendering: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [blurredInput, setBlurredInput] = useState<DimensionKey | null>(null);

  if (value === 0) return null;

  const handleSubmit = () => {
    setBlurredInput(dimKey);
    const clamped = clamp(localValue, min);
    setLocalValue(clamped);
    onChange(clamped);
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          disabled={isRendering && dimKey === blurredInput}
          dir="ltr"
          value={localValue}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {isRendering && dimKey === blurredInput ? (
            <Spinner className="text-primary" />
          ) : (
            "mm"
          )}
        </span>
      </div>
    </div>
  );
}
