import { Badge } from "@repo/ui/components/badge";
import { Card } from "@repo/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Section } from "./DetailsSection";
import DielineDownloadButton from "./DielineDownloadButton";
import { DimensionInput } from "./DimensionsInput";
import DimensionInfo from "./info/DimensionInfo";
import ThicknessInput from "./ThicknessInput";
import { pdfIcon, aiIcon, dxfIcon } from "@/public";
import {
  MaterialKey,
  MATERIALS,
  BLEED,
  DIMENSIONS,
  isSubscribed,
  DIMENSIONS_TYPE,
} from "@repo/dieline-core/data/consts";
import {
  DielineDimensions,
  MaterialsInput,
  DimensionsType,
  DimensionKey,
  Model,
  Dimensions,
  FormatsType,
} from "@repo/dieline-core/data/types";
import { isPackagingSizeLogical } from "@repo/dieline-core/utils/isPackagingSizeLogical";
import { DimensionType } from "@repo/dieline-core/utils/applyDimensionOffset";

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
  dimension: Dimensions;
  material: MaterialKey;
  isRendering: boolean;
  resolvedSizes: {
    width: number;
    height: number;
    length: number;
  };
}

export default function ProductDetails({
  defaultDimensions,
  setDimension,
  setDimensionType,
  setMaterial,
  setBleedAmount,
  setCustomThickness,
  dimensionType,
  dimension,
  dimensionsType,
  resolvedSizes: { height, width },
  svg,
  slug,
  materials,
  material,
  isRendering,
}: Props) {
  const [format, setFormat] = useState<FormatsType>("pdf");

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

  const isPackagingLogical = isPackagingSizeLogical(height, width);

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

            {!isPackagingLogical && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={"lightRed"} className="p-3 rounded-2xl">
                    <div className="flex gap-2">
                      <CircleQuestionMark size={16} />
                      <div className="text-wrap">
                        احتمال وجود خطای برش با ابعاد ورودی شما وجود دارد.
                      </div>
                    </div>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="max-w-sm leading-5">
                    دایلاین باید با استانداردهای مشخصات ساخت بسته‌بندی مطابقت
                    داشته باشد. پس از اینکه ابعاد را تنظیم کردید، ما بررسی‌های
                    منطقیِ ساختاری انجام می‌دهیم تا اطمینان حاصل شود که فایل با
                    مشخصات تولید مطابقت دارد.
                    <br />
                    اگر پیام «احتمال وجود خطای برش با ابعاد ورودی شما وجود
                    دارد.» نمایش داده شود، یعنی بسته‌بندی شما در بررسی منطقی
                    مردود شده است. با این حال، همچنان می‌توانید دایلاین را
                    دانلود کنید، اما باید پیش از تولید، جزئیات را به‌طور کامل با
                    کارخانه بررسی و تأیید کنید.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
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
            isPremium={!isSubscribed}
            title="اندازه بلید"
            infoContent={<DimensionInfo />}
          >
            <Select
              disabled={!isSubscribed}
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

          <Section
            isPremium={!isSubscribed}
            title="ضخامت"
            infoContent={<DimensionInfo />}
          >
            <ThicknessInput
              isRendering={isRendering}
              localCustomThickness={localCustomThickness}
              setLocalCustomThickness={setLocalCustomThickness}
              materialsIncluded={materials.included}
              selectedMaterialThickness={selectedMaterial.thickness}
              setCustomThickness={setCustomThickness}
            />
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
                      className="cursor-pointer data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
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
                  className="cursor-pointer w-1/3 data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="pt-1 text-muted-foreground">{value}</span>
                    <Image src={icon} alt={value} width={20} height={22} />
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <DielineDownloadButton
              format={format}
              isRendering={isRendering}
              slug={slug}
              svg={svg}
              dimensions={dimension}
            />
          </Section>
        </div>
      </Card>
    </div>
  );
}

export const FORMATS = [
  { value: "pdf", icon: pdfIcon },
  { value: "ai", icon: aiIcon },
  { value: "dxf", icon: dxfIcon },
] as const;
