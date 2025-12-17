import {
  applyDimensionOffset,
  DimensionType,
} from "@/lib/dielines/core/helpers/applyDimensionOffset";
import {
  Dimensions,
  DimensionsType,
  OffsetType,
} from "@/lib/dielines/core/types";
import { formatDimensions } from "@/utils/formatDimensions";
import { ptToMm } from "@/utils/sizeConvertor";

interface Props {
  dimension: Dimensions;
  dimensionsType: DimensionsType;
  dimensionType: DimensionType;
  offset: OffsetType;
}

const ProductInfo = ({
  dimensionsType,
  dimension,
  dimensionType,
  offset,
}: Props) => {
  const { height, length, width } = dimension;

  const calcManufacture = (value: number, axis: "width" | "length") =>
    applyDimensionOffset(
      value,
      dimensionType,
      dimensionType === "inner"
        ? ptToMm(offset[axis].inner)
        : ptToMm(offset[axis].outer)
    );

  const calcInner = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length"
  ) => {
    const base = dimensionType === "outer" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "inner" ? "manufacture" : "outer";

    return applyDimensionOffset(base, fromType, ptToMm(offset[axis].inner));
  };

  const calcOuter = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length"
  ) => {
    const base = dimensionType === "inner" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "outer" ? "manufacture" : "inner";

    return applyDimensionOffset(base, fromType, ptToMm(offset[axis].outer));
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
    <div className="absolute top-0 left-0 w-80 p-6 py-4">
      <div className="flex justify-between">
        {packLengend.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 mb-2">
            <div className={`h-1 w-7 rounded-full border ${color}`} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Dimensions */}
      <div>
        <div className="space-y-1">
          {dimensions.map(
            ({ label, value, key }) =>
              dimensionsType.includes(
                key as "manufacture" | "inner" | "outer"
              ) && (
                <div key={label} className="border w-3/4 p-2 rounded-2xl">
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

        {/* Deliveries */}
        <ul className="mt-4 space-y-2 list-disc list-inside">
          {deliveries.map((item, index) => (
            <li key={index} className="text-xs text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default ProductInfo;

const deliveries = [
  "تمام فایل‌های دایلاین در عرض چند دقیقه قابل تولید و دانلود هستند.",
  "تمام فایل‌های دایلاین از نظر ساختاری به‌طور دقیق بررسی می‌شوند. ابعاد، ضخامت و توضیحات مربوط به متریال در آن‌ها درج شده است و فایل‌ها کاملاً آماده چاپ هستند.",
  "تمام فایل‌های دایلاین بدون واترمارک بوده و امکان ویرایش محلی آن‌ها با نرم‌افزار Adobe Illustrator وجود دارد.",
];
