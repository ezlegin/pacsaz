import { Dimensions, DimensionsTypeType } from "@/lib/dielines/core/types";
import { formatDimensions } from "@/utils/formatDimensions";

interface Props {
  dimension: Dimensions;
  dimensionsType: DimensionsTypeType;
}

const ProductInfo = ({ dimensionsType, dimension }: Props) => {
  const { height, length, width } = dimension;

  const packLengend = [
    { color: "bg-blue-500", label: "خط برش" },
    { color: "bg-red-500", label: "خط تا" },
    { color: "bg-green-500", label: "خط بلید" },
  ];

  const dimensions = [
    {
      label: "ابعاد تولید",
      value: formatDimensions({ width, length, height }),
      key: "manufacture",
    },
    {
      label: "ابعاد داخلی",
      value: formatDimensions({ width, length, height }),
      key: "inner",
    },
    {
      label: "ابعاد خارجی",
      value: formatDimensions({ width, length, height }),
      key: "outer",
    },
  ];

  const deliveries = [
    "تمام فایل‌های دایلاین در عرض چند دقیقه قابل تولید و دانلود هستند.",
    "تمام فایل‌های دایلاین از نظر ساختاری به‌طور دقیق بررسی می‌شوند. ابعاد، ضخامت و توضیحات مربوط به متریال در آن‌ها درج شده است و فایل‌ها کاملاً آماده چاپ هستند.",
    "تمام فایل‌های دایلاین بدون واترمارک بوده و امکان ویرایش محلی آن‌ها با نرم‌افزار Adobe Illustrator وجود دارد.",
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
