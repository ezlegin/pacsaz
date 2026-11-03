"use client";

import { saveDielineDocument } from "@/actions/dieline";
import type { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import type { DielineDocument } from "@repo/dieline-engine";
import { EditorStore, Studio } from "@repo/editor";
import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function StudioEditor({
  dieline,
  categories,
  document,
  legacy,
}: {
  dieline: DielineType;
  categories: Categories;
  document: DielineDocument;
  legacy: boolean;
}) {
  const [store] = useState(
    () =>
      new EditorStore(document, {
        width: dieline.settings.width,
        length: dieline.settings.length,
        height: dieline.settings.height,
        thickness: dieline.settings.thickness,
        bleed: dieline.settings.bleed,
      }),
  );

  // The sizes the template is sold in: shown as ghosts and checked by the Studio.
  const sizeRange = useMemo(
    () => ({
      min: { width: dieline.minWidth, length: dieline.minLength, height: dieline.minHeight },
      max: { width: dieline.maxWidth, length: dieline.maxLength, height: dieline.maxHeight },
    }),
    [dieline],
  );

  // Saving the Settings tab refreshes the page data; the preview follows the new defaults.
  useEffect(() => {
    store.setInputs({
      width: dieline.settings.width,
      length: dieline.settings.length,
      height: dieline.settings.height,
      thickness: dieline.settings.thickness,
      bleed: dieline.settings.bleed,
    });
  }, [store, dieline.settings]);

  useEffect(() => {
    if (legacy) {
      toast.info("This dieline was made with the old editor. It opens empty here; saving replaces the old drawing.", {
        duration: 8000,
      });
    }
  }, [legacy]);

  return (
    <Studio
      store={store}
      title={dieline.title}
      sizeRange={sizeRange}
      leading={
        <Button variant="ghost" size="icon" asChild title="Back to dielines">
          <Link href="/dielines">
            <ArrowLeft />
          </Link>
        </Button>
      }
      settings={
        <div className="p-3 text-xs">
          <DielineSettingsForm categories={categories} dieline={dieline} compact />
        </div>
      }
      onSave={async (doc) => {
        const res = await saveDielineDocument(dieline.id, JSON.stringify(doc));
        if (res.ok) toast.success("Dieline saved");
        return res;
      }}
      onError={(message) => toast.error(message)}
    />
  );
}
