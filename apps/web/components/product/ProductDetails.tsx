import { aiIcon, dxfIcon, pdfIcon } from "@/public";
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
import { JSX } from "react";
import DimensionInfo from "./info/DimensionInfo";

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

const DIMENSIONS_TYPE = [
  { key: "manufacture", label: "ابعاد تولید" },
  { key: "inner", label: "ابعاد داخلی" },
  { key: "outer", label: "ابعاد خارجی" },
] as const;

export default function ProductDetails({ dimensions, setDimension }: Props) {
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
                  value={dimensions[key]}
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
              {DIMENSIONS_TYPE.map(({ label, key }) => (
                <ToggleGroupItem
                  key={key}
                  value={key}
                  className="border-2 cursor-pointer w-1/3 data-[state=on]:border-primary data-[state=on]:bg-transparent hover:border-primary hover:bg-transparent"
                >
                  <p className="font-normal text-xs">{label}</p>
                </ToggleGroupItem>
              ))}
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
              defaultValue="PDF"
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

            <Button size="lg" className="mt-4 w-full gap-2 font-medium">
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
