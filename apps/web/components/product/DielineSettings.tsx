import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { DIMENSIONS, DIMENSIONS_TYPE } from "@repo/dieline-core/data/consts";
import {
  DielineDimensions,
  DielineMaterials,
  DimensionsType,
} from "@repo/dieline-core/data/types";
import { isPackagingSizeLogical } from "@repo/dieline-core/utils/isPackagingSizeLogical";
import { useUserStore } from "@repo/store/app/user.store";
import { bleeds as BLEEDS } from "@repo/store/data/dieline";
import { DimensionType, Format } from "@repo/store/data/types";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
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
import { Section } from "./DetailsSection";
import DielineDownloadButton from "./DielineDownloadButton";
import { DimensionInput } from "./DimensionsInput";
import BleedGuide from "./guides/BleedGuide";
import DimensionGuide from "./guides/DimensionGuide";
import DimensionTypeGuide from "./guides/DimensionTypeGuide";
import FormatGuide from "./guides/FormatGuide";
import MeterialGuide from "./guides/materialGuide";
import ThicknessGuide from "./guides/ThicknessGuide";
import MaterialInput from "./MaterialInput";
import ThicknessInput from "./ThicknessInput";

interface Props {
  defaultDimensions: DielineDimensions;
  materialsInput: DielineMaterials;
  dimensionsType: DimensionsType;
  slug: string;
  isRendering: boolean;
}

export default function DielineSettings({
  defaultDimensions,
  dimensionsType,
  slug,
  materialsInput,
  isRendering,
}: Props) {
  const { svg } = useSVGStore();
  const { isPremium } = useUserStore();
  const {
    setSetting,
    settings: { bleed, dimensionType, format },
  } = useDielineSettingsStore();

  const {
    settings: { dimension },
  } = useDielineSettingsStore();

  const bleeds = Object.entries(BLEEDS).map(([type, size]) => ({
    type,
    size,
  }));

  const slateColors = [
    "bg-slate-300",
    "bg-slate-400",
    "bg-slate-500",
    "bg-slate-600",
  ];

  const isPackagingLogical = isPackagingSizeLogical(
    dimension.raw.height,
    dimension.raw.width
  );

  return (
    <Card className="h-full flex flex-col justify-between p-6 z-10">
      <div className="space-y-5">
        <Section title="ابعاد" infoContent={<DimensionGuide />}>
          <div className="grid grid-cols-2 gap-4">
            {DIMENSIONS.map(({ key, label }) => (
              <DimensionInput
                key={key}
                label={label}
                min={defaultDimensions.minDimensions[key]}
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
                  اگر پیام «احتمال وجود خطای برش با ابعاد ورودی شما وجود دارد.»
                  نمایش داده شود، یعنی بسته‌بندی شما در بررسی منطقی مردود شده
                  است. با این حال، همچنان می‌توانید دایلاین را دانلود کنید، اما
                  باید پیش از تولید، جزئیات را به‌طور کامل با کارخانه بررسی و
                  تأیید کنید.
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </Section>

        <Section title="متریال چاپ" infoContent={<MeterialGuide />}>
          <MaterialInput materialsInput={materialsInput} />
        </Section>

        <Section
          isPremium={isPremium}
          title="اندازه بلید"
          infoContent={<BleedGuide />}
        >
          <Select
            disabled={!isPremium}
            defaultValue={bleed?.toString()}
            onValueChange={(val: string) => setSetting("bleed", +val)}
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
          isPremium={isPremium}
          title="ضخامت"
          infoContent={<ThicknessGuide />}
        >
          <ThicknessInput
            isRendering={isRendering}
            materialsIncluded={materialsInput.included}
          />
        </Section>

        <Section title="نوع ابعاد" infoContent={<DimensionTypeGuide />}>
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
            </div>
          </ToggleGroup>
        </Section>
      </div>

      <div className="space-y-4">
        <Section title="فرمت" infoContent={<FormatGuide />}>
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
        </Section>
        <DielineDownloadButton
          isRendering={isRendering}
          slug={slug}
          svg={svg}
        />
      </div>
    </Card>
  );
}

export const FORMATS = [
  { value: "pdf", icon: pdfIcon },
  { value: "ai", icon: aiIcon },
  { value: "dxf", icon: dxfIcon },
] as const;
