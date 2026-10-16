import { DIMENSIONS, DIMENSIONS_TYPE } from "@/data/consts";
import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { isPackagingSizeLogical } from "@repo/dieline-core/utils/isPackagingSizeLogical";
import { bleeds as BLEEDS } from "@repo/dieline-core/data/materials";
import { Badge } from "@repo/ui/components/badge";
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
import { cn } from "@repo/ui/lib/utils";
import { CircleQuestionMark, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { Section } from "./DetailsSection";
import DielineDownloadButton, { UserType } from "./DielineDownloadButton";
import { DimensionInput } from "./DimensionsInput";
import BleedGuide from "./guides/BleedGuide";
import DimensionGuide from "./guides/DimensionGuide";
import DimensionTypeGuide from "./guides/DimensionTypeGuide";
import FormatGuide from "./guides/FormatGuide";
import MeterialGuide from "./guides/materialGuide";
import ThicknessGuide from "./guides/ThicknessGuide";
import MaterialInput from "./MaterialInput";
import ThicknessInput from "./ThicknessInput";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSetting } from "@repo/store/slices/dielineSettingsSlice";
import { DimensionType } from "@repo/db";
import { Format } from "@repo/store/types";

interface Props {
  slug: string;
  isRendering: boolean;
  user: UserType | null;
}

export default function DielineSettings({ slug, isRendering, user }: Props) {
  const {
    bleed,
    dimensionType,
    format,
    dimension,
    minDimension,
    dimensionTypes,
    maxDimension,
  } = useAppSelector((s) => s.dielineSettings);
  const dispatch = useAppDispatch();

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
    dimension.raw.width,
  );

  const isPremium = !!user && user.plan?.isPremium;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm z-10">
      {/* ------------------------------- header ------------------------------ */}
      <div className="flex shrink-0 items-center gap-2.5 border-b bg-muted/30 px-5 py-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <SlidersHorizontal className="size-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xs font-bold">تنظیمات قالب</h2>
          <p className="truncate text-[10px] text-muted-foreground">
            ابعاد، متریال و خروجی را اینجا تنظیم کن
          </p>
        </div>
      </div>

      {/* -------------------------------- body ------------------------------- */}
      <div className="scrollbar-soft min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <Section title="ابعاد" infoContent={<DimensionGuide />}>
          <div className="grid grid-cols-2 gap-3">
            {DIMENSIONS.map(({ key, label }) => (
              <DimensionInput
                key={key}
                label={label}
                min={minDimension[key]}
                max={maxDimension[key]}
                dimKey={key}
                isRendering={isRendering}
              />
            ))}
          </div>

          {!isPackagingLogical && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={"lightRed"}
                  className="mt-3 w-full rounded-2xl p-3"
                >
                  <div className="flex items-start gap-2 text-right">
                    <CircleQuestionMark size={15} className="mt-0.5 shrink-0" />
                    <div className="text-wrap text-[11px] leading-5">
                      احتمال وجود خطای برش با ابعاد ورودی شما وجود دارد.
                    </div>
                  </div>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-sm">
                <p className="text-[11px] leading-6">
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
          <MaterialInput />
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
              if (val)
                dispatch(
                  setSetting({
                    key: "dimensionType",
                    value: val as DimensionType,
                  }),
                );
            }}
            className="block w-full"
          >
            <div className="grid w-full grid-cols-3 gap-2">
              {DIMENSIONS_TYPE.map(
                ({ label, key }) =>
                  dimensionTypes.includes(key) && (
                    <ToggleGroupItem
                      key={key}
                      value={key}
                      className={cn(
                        "cursor-pointer rounded-xl text-xs font-normal transition-colors",
                        "data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:font-bold data-[state=on]:text-primary",
                        "hover:border-primary/40 hover:bg-transparent",
                      )}
                    >
                      {label}
                    </ToggleGroupItem>
                  ),
              )}
            </div>
          </ToggleGroup>
        </Section>

        <Section
          isPremium={isPremium}
          title="اندازه بلید"
          infoContent={<BleedGuide />}
        >
          <Select
            disabled={!isPremium}
            value={String(bleed)}
            onValueChange={(val: string) =>
              dispatch(setSetting({ key: "bleed", value: +val }))
            }
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
                    className={cn(slateColors[idx], "w-5 rounded-sm")}
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
          <ThicknessInput isRendering={isRendering} isPremium={isPremium} />
        </Section>

        <Section title="فرمت فایل" infoContent={<FormatGuide />}>
          <ToggleGroup
            type="single"
            size="lg"
            dir="rtl"
            variant="outline"
            spacing={1}
            value={format}
            onValueChange={(val) => {
              if (val)
                dispatch(setSetting({ key: "format", value: val as Format }));
            }}
            className="block w-full"
          >
            <div className="grid w-full grid-cols-3 gap-2">
              {FORMATS.map(({ value, icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className={cn(
                    "cursor-pointer rounded-xl transition-colors",
                    "data-[state=on]:border-primary data-[state=on]:bg-primary/10",
                    "hover:border-primary/40 hover:bg-transparent",
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Image src={icon} alt={value} width={18} height={20} />
                    <span className="text-[11px] uppercase text-muted-foreground">
                      {value}
                    </span>
                  </div>
                </ToggleGroupItem>
              ))}
            </div>
          </ToggleGroup>
        </Section>
      </div>

      {/* ------------------------------- footer ------------------------------ */}
      <div className="shrink-0 border-t bg-muted/20 p-4">
        <DielineDownloadButton
          isRendering={isRendering}
          slug={slug}
          user={user}
        />
      </div>
    </aside>
  );
}

export const FORMATS = [
  { value: "pdf", icon: pdfIcon },
  { value: "ai", icon: aiIcon },
  { value: "dxf", icon: dxfIcon },
] as const;
