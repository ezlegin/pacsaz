import { formatDimensions } from "@/utils/formatDimensions";
import { DimensionType } from "@repo/db";
import { applyDimensionOffset } from "@repo/dieline-core/utils/applyDimensionOffset";
import { resolveOffsets } from "@repo/dieline-core/utils/offsetResolver";
import { useAppSelector } from "@repo/store/hooks";
import { cn } from "@repo/ui/lib/utils";

import { Info, Ruler } from "lucide-react";
import DielinePreview3D from "./DielinePreview3D";
import { UserType } from "./DielineDownloadButton";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });

/**
 * Spec panel for the dieline editor.
 *
 * The 3D preview replaced the static model render: it rebuilds from the live
 * store, so it follows every specification change. The user is passed through
 * because previewing artwork on the model is a paid feature.
 */
const ProductInfo = ({
  isRendering,
  user,
}: {
  isRendering: boolean;
  user: UserType | null;
}) => {
  const offset = resolveOffsets();

  const {
    dimensionType,
    dimensionTypes,
    dimension: {
      raw: { height, length, width },
    },
  } = useAppSelector((s) => s.dielineSettings);

  const calcManufacture = (value: number, axis: "width" | "length") =>
    applyDimensionOffset(
      value,
      dimensionType,
      dimensionType === "inner"
        ? (offset?.[axis].inner ?? 0)
        : (offset?.[axis].outer ?? 0),
    );

  const calcInner = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length",
  ) => {
    const base = dimensionType === "outer" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "inner" ? "manufacture" : "outer";

    return applyDimensionOffset(base, fromType, offset?.[axis].inner ?? 0);
  };

  const calcOuter = (
    rawValue: number,
    manufactureValue: number,
    axis: "width" | "length",
  ) => {
    const base = dimensionType === "inner" ? manufactureValue : rawValue;

    const fromType: DimensionType =
      dimensionType === "outer" ? "manufacture" : "inner";

    return applyDimensionOffset(base, fromType, offset?.[axis].outer ?? 0);
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
    { color: "bg-blue-500", label: "خط برش", dashed: false },
    { color: "bg-red-500", label: "خط تا", dashed: true },
    { color: "bg-green-500", label: "خط بلید", dashed: true },
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

  const visibleDimensions = dimensions.filter(({ key }) =>
    dimensionTypes.includes(key as "manufacture" | "inner" | "outer"),
  );

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm z-10">
      {/* ------------------------------- header ------------------------------ */}
      <div className="flex shrink-0 items-center gap-2.5 border-b bg-muted/30 px-5 py-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Ruler className="size-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xs font-bold">مشخصات قالب</h2>
          <p className="truncate text-[10px] text-muted-foreground">
            ابعاد نهایی و راهنمای خطوط
          </p>
        </div>
      </div>

      <div className="scrollbar-soft min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {/* ------------------------------- legend ---------------------------- */}
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-2">
          {packLengend.map(({ color, label, dashed }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={cn("h-0.5 w-7 rounded-full", color)}
                style={
                  dashed
                    ? {
                        backgroundImage: `repeating-linear-gradient(90deg, ${
                          color === "bg-red-500" ? "#ef4444" : "#22c55e"
                        } 0 4px, transparent 4px 7px)`,
                        backgroundColor: "transparent",
                      }
                    : undefined
                }
              />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* ------------------------------ 3d preview -------------------------- */}
        <DielinePreview3D isRendering={isRendering} user={user} />

        {/* ------------------------------ dimensions -------------------------- */}
        {visibleDimensions.length > 0 && (
          <ul className="space-y-2">
            {visibleDimensions.map(({ label, value, key }) => (
              <li
                key={label}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5",
                  key === dimensionType
                    ? "border-primary/30 bg-primary/[0.05]"
                    : "bg-muted/20",
                )}
              >
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  {label}
                  {key === dimensionType && (
                    <span className="rounded-md bg-primary/15 px-1.5 text-[9px] font-bold text-primary">
                      فعال
                    </span>
                  )}
                </span>
                <span
                  dir="ltr"
                  className="shrink-0 text-[11px] font-bold tabular-nums"
                >
                  {value}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* ------------------------------ what you get ------------------------ */}
        <ul className="space-y-3 border-t pt-5">
          {deliveries.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                {fa(index + 1)}
              </span>
              <span className="text-[11px] leading-6 text-muted-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <p className="flex items-start gap-2 border-t pt-4 text-[10px] leading-5 text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          پیش از تولید، ابعاد و مشخصات فنی را با چاپخانه بررسی کنید.
        </p>
      </div>
    </aside>
  );
};

export default ProductInfo;

const deliveries = [
  "تمام فایل‌های دایلاین در عرض چند دقیقه قابل تولید و دانلود هستند.",
  "تمام فایل‌های دایلاین از نظر ساختاری به‌طور دقیق بررسی می‌شوند. ابعاد، ضخامت و توضیحات مربوط به متریال در آن‌ها درج شده است و فایل‌ها کاملاً آماده چاپ هستند.",
  "تمام فایل‌های دایلاین بدون واترمارک بوده و امکان ویرایش محلی آن‌ها با نرم‌افزار Adobe Illustrator وجود دارد.",
];
