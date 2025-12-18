import { useLoading } from "@/hooks/useLoading";
import { clamp } from "@/hooks/useSize";
import { downloadPdf } from "@/lib/actions/export/downloader";
import {
  DIMENSIONS,
  DIMENSIONS_TYPE,
  FORMATS,
  MaterialKey,
  MATERIALS,
} from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import {
  DielineDimensions,
  DimensionKey,
  DimensionsType,
  FormatsType,
  MaterialsInput,
  SVGModel,
} from "@/lib/dielines/core/types";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Info } from "lucide-react";
import Image from "next/image";
import { JSX, useState } from "react";
import DielineDownloadButton from "./DielineDownloadButton";
import DimensionInfo from "./info/DimensionInfo";

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
  dimensionType: DimensionType;
  setDimensionType: (value: DimensionType) => void;
  svg: SVGModel;
  slug: string;
  material: MaterialKey;
}

export default function ProductDetails({
  defaultDimensions,
  setDimension,
  setDimensionType,
  setMaterial,
  dimensionType,
  dimensionsType,
  svg,
  slug,
  materials,
  material,
}: Props) {
  const [format, setFormat] = useState<FormatsType>("pdf");

  const { startLoading, stopLoading, isLoading } = useLoading();

  const onDownload = async () => {
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

  return (
    <div className="p-3 h-full absolute right-0 top-0 z-10">
      <Card className="h-full w-80 flex flex-col justify-between overflow-y-auto bg-white p-6 ">
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

          <Section title="ضخامت" infoContent={<DimensionInfo />}>
            <Input
              dir="ltr"
              value={`${selectedMaterial?.thickness} mm`}
              disabled
              className="text-center"
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

            <DielineDownloadButton loading={isLoading} download={onDownload} />
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

  if (value === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          dir="ltr"
          value={localValue}
          onFocus={(e) => {
            e.target.select();
          }}
          onChange={(e) => {
            const raw = Number(e.target.value);

            setLocalValue(raw);
          }}
          onBlur={(e) => {
            const raw = Number(e.target.value);

            const clamped = clamp(raw, min);
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
