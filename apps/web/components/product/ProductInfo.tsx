import {
  applyDimensionOffset,
  DimensionType,
} from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { Dimensions, DimensionsType } from "@/lib/dielines/core/types";
import { formatDimensions } from "@/utils/formatDimensions";
import { ptToMm } from "@/utils/sizeConvertor";

interface Props {
  dimension: Dimensions;
  dimensionsType: DimensionsType;
  dimensionType: DimensionType;
  offset: {
    width: number;
    length: number;
  };
}

const ProductInfo = ({
  dimensionsType,
  dimension,
  dimensionType,
  offset,
}: Props) => {
  const { height, length, width } = dimension;

  const manufactureDimWidth = applyDimensionOffset(
    width,
    dimensionType,
    ptToMm(offset.width)
  );
  const manufactureDimLength = applyDimensionOffset(
    length,
    dimensionType,
    ptToMm(offset.length)
  );

  const innerDimWidth = applyDimensionOffset(
    dimensionType === "outer" ? manufactureDimWidth : width,
    dimensionType === "inner"
      ? "manufacture"
      : dimensionType === "outer"
        ? "outer"
        : "outer",
    ptToMm(offset.width)
  );

  const innerDimLength = applyDimensionOffset(
    dimensionType === "outer" ? manufactureDimLength : length,
    dimensionType === "inner"
      ? "manufacture"
      : dimensionType === "outer"
        ? "outer"
        : "outer",
    ptToMm(offset.length)
  );

  const outerDimWidth = applyDimensionOffset(
    dimensionType === "inner" ? manufactureDimWidth : width,
    dimensionType === "outer"
      ? "manufacture"
      : dimensionType === "inner"
        ? "inner"
        : "inner",
    ptToMm(offset.width)
  );

  const outerDimLength = applyDimensionOffset(
    dimensionType === "inner" ? manufactureDimLength : length,
    dimensionType === "outer"
      ? "manufacture"
      : dimensionType === "inner"
        ? "inner"
        : "inner",
    ptToMm(offset.length)
  );

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
      <div className="space-y-1 mb-6">
        {dimensions.map(
          ({ label, value, key }) =>
            dimensionsType.includes(
              key as "manufacture" | "inner" | "outer"
            ) && (
              <div key={label}>
                <span className="block text-muted-foreground text-xs">
                  {label}
                </span>
                <span dir="ltr" className="font-medium text-sm">
                  {value}
                </span>
              </div>
            )
        )}

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
