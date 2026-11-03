"use client";

import { DIMENSIONS } from "@/data/consts";
import { DielineType } from "@/data/types";
import { FA_CUSTOMIZE, FA_FOLD } from "@/lib/dieline/customizeStrings";
import { loadCustomization, manufactureSize } from "@/lib/dieline/engine";
import type { CustomDielineSettings, SavedDieline } from "@repo/db";
import type { Customization, DielineDocument, VerifyResult } from "@repo/dieline-engine";
import { Customizer, FoldPreview } from "@repo/editor";
import { useAppSelector } from "@repo/store/hooks";
import { Box } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DielineDownloadButton, { UserType } from "./DielineDownloadButton";
import { DimensionInput } from "./DimensionsInput";
import MaterialInput from "./MaterialInput";
import { useEngineDieline } from "./useEngineDieline";

/**
 * The paid customer editor. Size and material come from the same controls as the
 * product page (the Redux settings); everything else is a `Customization`
 * overlay edited in the shared Customizer, and saved or downloaded through server
 * actions that verify it again.
 */
export default function CustomizeEditor({
  dieline,
  template,
  user,
  saved,
}: {
  dieline: DielineType;
  template: DielineDocument;
  user: UserType;
  saved: (SavedDieline & { settings: CustomDielineSettings | null }) | null;
}) {
  const router = useRouter();
  const { isRendering } = useEngineDieline({ ...dieline, customSettings: saved?.settings ?? null }, { watermark: false });
  const settings = useAppSelector((s) => s.dielineSettings);
  const [value, setValue] = useState<Customization>(() => loadCustomization(saved?.settings?.customization));
  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const [fold, setFold] = useState(false);

  // Until the store has the template's defaults, the size is zero.
  const ready = settings.dimension.raw.width > 0 || settings.dimension.raw.length > 0;
  const inputs = useMemo(() => {
    const size = manufactureSize(settings.dimension.raw, settings.dimensionType, settings.material.value, settings.thickness);
    return { ...size, thickness: settings.thickness, bleed: settings.bleed };
  }, [settings.dimension.raw, settings.dimensionType, settings.material.value, settings.thickness, settings.bleed]);

  const blocked = verified && !verified.ok ? "پیش از دانلود، موارد «بررسی تولید» را برطرف کنید." : null;

  const header = (
    <div className="space-y-3 p-4">
      <p className="text-xs font-bold">ابعاد و متریال</p>
      <div className="grid grid-cols-3 gap-2">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={settings.minDimension[key]}
            max={settings.maxDimension[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </div>
      <MaterialInput />
    </div>
  );

  const footer = (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setFold(!fold)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs hover:bg-accent"
      >
        <Box className="size-4" />
        {fold ? "بستن پیش‌نمایش سه‌بعدی" : "پیش‌نمایش سه‌بعدی"}
      </button>
      <DielineDownloadButton
        slug={dieline.slug}
        isRendering={isRendering}
        user={user}
        customization={JSON.stringify(value)}
        savedDieline={saved ?? undefined}
        onSaved={(id) => router.replace(`/dieline/${dieline.slug}/customize?saved=${id}`)}
        blocked={blocked}
      />
    </div>
  );

  if (!ready) return null;

  return (
    <Customizer
      className="h-full"
      template={template}
      inputs={inputs}
      value={value}
      onChange={setValue}
      strings={FA_CUSTOMIZE}
      header={header}
      footer={footer}
      onVerified={setVerified}
      overlay={(result) =>
        fold && (
          <FoldPreview
            result={result}
            thickness={inputs.thickness}
            folds={template.folds}
            strings={FA_FOLD}
            onClose={() => setFold(false)}
            className="left-3 right-auto"
          />
        )
      }
    />
  );
}
