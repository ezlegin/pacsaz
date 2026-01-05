import { onDevelepe } from "@/lib/dielines/core/consts";
import {
  applyDimensionOffset,
  DimensionType,
} from "@/lib/dielines/core/helpers/applyDimensionOffset";
import {
  Dimensions,
  DimensionsType,
  SVGModelSizes,
} from "@/lib/dielines/core/types";
import { tuckEndModel } from "@/public";
import { formatDimensions } from "@/utils/formatDimensions";
import { toMm } from "@/utils/sizeConvertor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import Image from "next/image";
import DeveloperTools from "./DeveloperTools";

interface Props {
  dimension: Dimensions;
  dimensionsType: DimensionsType;
  dimensionType: DimensionType;
  sizes: SVGModelSizes | undefined;
  slug: string | undefined;
  showWatermark: boolean;
  showOverallDimensions: boolean;
  doCenterSVG: boolean;
  showAnchors: boolean;
  setShowOverallDimensions: (val: boolean) => void;
  setShowAnchors: (val: boolean) => void;
  setShowWatermark: (val: boolean) => void;
  setDoCenterSVG: (val: boolean) => void;
}

const ProductInfo = ({
  dimensionsType,
  dimension,
  dimensionType,
  sizes,
  slug,
  showWatermark,
  showOverallDimensions,
  doCenterSVG,
  showAnchors,
  setShowAnchors,
  setShowWatermark,
  setShowOverallDimensions,
  setDoCenterSVG,
}: Props) => {
  const { height, length, width } = dimension;

  const calcManufacture = (value: number, axis: "width" | "length") =>
    applyDimensionOffset(
      value,
      dimensionType,
      dimensionType === "inner"
        ? toMm(sizes?.offset[axis].inner ?? 0)
        : toMm(sizes?.offset[axis].outer ?? 0)
    );

  const calcInner = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length"
  ) => {
    const base = dimensionType === "outer" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "inner" ? "manufacture" : "outer";

    return applyDimensionOffset(
      base,
      fromType,
      toMm(sizes?.offset[axis].inner ?? 0)
    );
  };

  const calcOuter = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length"
  ) => {
    const base = dimensionType === "inner" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "outer" ? "manufacture" : "inner";

    return applyDimensionOffset(
      base,
      fromType,
      toMm(sizes?.offset[axis].outer ?? 0)
    );
  };

  // manufacture dims
  const manufactureDimWidth = calcManufacture(width, "width");
  const manufactureDimLength = calcManufacture(length, "length");

  // inner dims
  const innerDimWidth = calcInner(width, manufactureDimWidth, "width");
  const innerDimLength = calcInner(length, manufactureDimLength, "length");

  // outer dims
  const outerDimWidth = calcOuter(width, manufactureDimWidth, "width");
  const outerDimLength = calcOuter(length, manufactureDimLength, "length");

  const packLengend = [
    { color: "bg-blue-500", label: "خط برش" },
    { color: "bg-red-500", label: "خط تا" },
    { color: "bg-green-500", label: "خط بلید" },
  ];

  const dimensions = [
    {
      label: "ابعاد تولید",
      value: formatDimensions({
        width: manufactureDimWidth,
        length: manufactureDimLength,
        height,
      }),
      key: "manufacture",
    },
    {
      label: "ابعاد داخلی",
      value: formatDimensions({
        width: innerDimWidth,
        length: innerDimLength,
        height,
      }),
      key: "inner",
    },
    {
      label: "ابعاد خارجی",
      value: formatDimensions({
        width: outerDimWidth,
        length: outerDimLength,
        height,
      }),
      key: "outer",
    },
  ];

  return (
    <div className="flex flex-col justify-between w-full bg-accent/40 z-10 p-3 rounded-2xl h-fit backdrop-blur-[2px]">
      <div className="space-y-3">
        <div className="flex justify-between">
          {packLengend.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`h-1 w-7 rounded-full border ${color}`} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        <Dialog>
          <DialogTrigger>
            <Image
              alt=""
              src={tuckEndModel}
              width={300}
              height={300}
              className="bg-accent rounded-2xl cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="p-0 bg-transparent border-none sm:max-w-2xl"
          >
            <DialogHeader>
              <DialogTitle className="sr-only" />
              <Image
                alt=""
                src={tuckEndModel}
                width={700}
                height={700}
                className="bg-accent rounded-2xl"
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="space-y-1">
          {dimensions.map(
            ({ label, value, key }) =>
              dimensionsType.includes(
                key as "manufacture" | "inner" | "outer"
              ) && (
                <div key={label} className="border p-2 rounded-2xl">
                  <span className="block text-muted-foreground text-xs">
                    {label}
                  </span>
                  <span dir="ltr" className="font-medium text-sm">
                    {value}
                  </span>
                </div>
              )
          )}
        </div>

        <ul className="mt-4 space-y-2 list-disc list-inside">
          {deliveries.map((item, index) => (
            <li key={index} className="text-xs text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {onDevelepe && sizes && (
        <DeveloperTools
          doCenterSVG={doCenterSVG}
          setDoCenterSVG={setDoCenterSVG}
          setShowAnchors={setShowAnchors}
          setShowOverallDimensions={setShowOverallDimensions}
          setShowWatermark={setShowWatermark}
          showAnchors={showAnchors}
          showOverallDimensions={showOverallDimensions}
          showWatermark={showWatermark}
          sizes={sizes}
          slug={slug}
        />
      )}
    </div>
  );
};
export default ProductInfo;

const deliveries = [
  "تمام فایل‌های دایلاین در عرض چند دقیقه قابل تولید و دانلود هستند.",
  "تمام فایل‌های دایلاین از نظر ساختاری به‌طور دقیق بررسی می‌شوند. ابعاد، ضخامت و توضیحات مربوط به متریال در آن‌ها درج شده است و فایل‌ها کاملاً آماده چاپ هستند.",
  "تمام فایل‌های دایلاین بدون واترمارک بوده و امکان ویرایش محلی آن‌ها با نرم‌افزار Adobe Illustrator وجود دارد.",
];
