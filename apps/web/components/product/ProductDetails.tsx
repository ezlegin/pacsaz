import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { Button } from "@workspace/ui/components/button";
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

export type DimensionKey = "width" | "length" | "height";

interface Props {
  dimensions: Record<DimensionKey, number>;
  setDimension: (key: DimensionKey, value: number) => void;
}

const DIMENSIONS = [
  { key: "width", label: "عرض" },
  { key: "length", label: "طول" },
  { key: "height", label: "ارتفاع" },
] as const;

const FORMATS = [
  { value: "PDF", icon: pdfIcon },
  { value: "AI", icon: aiIcon },
  { value: "DXF", icon: dxfIcon },
] as const;

const MATERIALS = [
  {
    label: "مقوا",
    items: [
      { value: "white-cardboard", label: "مقوا سفید", color: "bg-white" },
      { value: "kraft-cardboard", label: "مقوا کرافت", color: "bg-orange-100" },
    ],
  },
  {
    label: "کارتن",
    items: [
      { value: "e-flute", label: "کارتن E-Flut", color: "bg-orange-100" },
      { value: "b-flute", label: "کارتن B-Flut", color: "bg-orange-100" },
      { value: "c-flute", label: "کارتن C-Flut", color: "bg-orange-100" },
    ],
  },
];

export default function ProductDetails({ dimensions, setDimension }: Props) {
  return (
    <div className="h-full flex flex-col justify-between w-80 overflow-y-auto rounded-2xl bg-white p-6 shadow-md">
      <div className="space-y-8">
        {/* Dimensions */}
        <Section title="ابعاد">
          <div className="grid grid-cols-2 gap-4">
            {DIMENSIONS.map(({ key, label }) => (
              <DimensionInput
                key={key}
                label={label}
                value={dimensions[key]}
                onChange={(value) => setDimension(key, value)}
              />
            ))}
          </div>
        </Section>

        {/* Material */}
        <Section title="متریال چاپ">
          <Select dir="rtl" defaultValue="white-cardboard">
            <SelectTrigger>
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

        {/* Thickness */}
        <Section title="ضخامت">
          <Input dir="ltr" value="0.5 mm" disabled className="text-center" />
        </Section>
      </div>

      <div>
        {/* Format & Download */}
        <Section title="فرمت">
          <ToggleGroup
            type="single"
            size="lg"
            variant="outline"
            defaultValue="PDF"
            className="w-full"
          >
            {FORMATS.map(({ value, icon }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="w-1/3 border"
              >
                <Image src={icon} alt={value} width={20} height={20} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button size="lg" className="mt-4 w-full gap-2">
            <Download />
            دانلود فایل
          </Button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1 text-xs font-semibold">
        {title}
        <Info size={14} className="text-muted-foreground" />
      </p>
      {children}
    </div>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          dir="ltr"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          mm
        </span>
      </div>
    </div>
  );
}
