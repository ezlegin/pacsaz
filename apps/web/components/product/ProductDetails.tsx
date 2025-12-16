import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { clamp } from "@/hooks/useSize";
import { downloadPdf } from "@/lib/actions/export/downloader";
import {
  DIMENSIONS,
  DIMENSIONS_TYPE,
  FORMATS,
  margins,
  MATERIALS,
} from "@/lib/dielines/core/consts";
import {
  DielineDimensions,
  DimensionsTypeType,
  FormatsType,
} from "@/lib/dielines/core/types";
import { Button } from "@workspace/ui/components/button";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Download, Info } from "lucide-react";
import Image from "next/image";
import { JSX, useEffect, useState } from "react";
import DimensionInfo from "./info/DimensionInfo";

export type DimensionKey = "width" | "length" | "height";

interface Props {
  dimensions: DielineDimensions;
  dimensionsType: DimensionsTypeType;
  setDimension: (key: DimensionKey, value: number) => void;
  svg: string;
  slug: string;
}

export default function ProductDetails({
  dimensions,
  setDimension,
  dimensionsType,
  svg,
  slug,
}: Props) {
  const [format, setFormat] = useState<FormatsType>("PDF");

  const download = async () => {
    await downloadPdf({
      svg,
      filename: slug + "-dieline",
      svgSize: {
        widthMM: 180 + margins.container * 2,
        lengthMM: 160 + margins.container * 2,
      },
      format,
    }); //todo: get the SVG width and height and pass it here.
  };

  return (
    <div className="p-3 h-full absolute right-0 top-0 z-10">
      <div className="h-full w-80 flex flex-col justify-between overflow-y-auto rounded-2xl bg-white p-6 shadow-md">
        <div className="space-y-8">
          <Section title="ابعاد" infoContent={<DimensionInfo />}>
            <div className="grid grid-cols-2 gap-4">
              {DIMENSIONS.map(({ key, label }) => (
                <DimensionInput
                  key={key}
                  label={label}
                  value={dimensions.defaultDimensions[key]}
                  min={dimensions.minDimensions[key]}
                  onChange={(value) => setDimension(key, value)}
                />
              ))}
            </div>
          </Section>

          <Section title="متریال چاپ" infoContent={<DimensionInfo />}>
            <Select dir="rtl" defaultValue="white-cardboard">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب متریال" />
              </SelectTrigger>

              <SelectContent position="popper">
                {MATERIALS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        <span
                          className={`h-5 w-5 rounded-full border ${item.color}`}
                        />
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Section>

          <Section title="ضخامت" infoContent={<DimensionInfo />}>
            <Input dir="ltr" value="0.5 mm" disabled className="text-center" />
          </Section>

          <Section title="نوع ابعاد" infoContent={<DimensionInfo />}>
            <ToggleGroup
              type="single"
              variant="outline"
              size="lg"
              defaultValue="manufacture"
              spacing={2}
              dir="rtl"
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

            <Button
              onClick={download}
              size="lg"
              className="mt-4 w-full gap-2 font-medium"
            >
              <Download />
              دانلود فایل
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  infoContent,
}: {
  title: string;
  infoContent: JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
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
      {children}
    </div>
  );
}

function DimensionInput({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  // sync when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedChange = useDebouncedCallback((val: number) => {
    const clamped = clamp(val, min);
    onChange(clamped);
  }, 1000);

  if (value === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          dir="ltr"
          value={localValue}
          onChange={(e) => {
            const raw = Number(e.target.value);

            setLocalValue(raw);

            debouncedChange(raw);
          }}
          onBlur={() => {
            const clamped = clamp(localValue, min);
            setLocalValue(clamped);
            onChange(clamped);
          }}
        />
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          mm
        </span>
      </div>
    </div>
  );
}
