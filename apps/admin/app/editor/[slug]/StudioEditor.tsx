"use client";

import { saveDielineDocument } from "@/actions/dieline";
import type { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import PreviewSettings from "./PreviewSettings";
import type { DielineDocument } from "@repo/dieline-engine";
import { EditorStore, Studio } from "@repo/editor";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

const noSubscribe = () => () => {};

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

  // Saving the dieline settings refreshes the page data; the preview follows the new defaults.
  useEffect(() => {
    store.setInputs({
      width: dieline.settings.width,
      length: dieline.settings.length,
      height: dieline.settings.height,
      thickness: dieline.settings.thickness,
      bleed: dieline.settings.bleed,
    });
  }, [store, dieline.settings]);

  // The 3D dock shows the template's board from the start (kraft with flutes for
  // flute materials), not only once the Settings tab has been opened.
  useEffect(() => {
    store.setDisplay({ material: dieline.settings.material || dieline.defaultMaterial });
  }, [store, dieline.settings.material, dieline.defaultMaterial]);

  useEffect(() => {
    if (legacy) {
      toast.info("This dieline was made with the old editor. It opens empty here; saving replaces the old drawing.", {
        duration: 8000,
      });
    }
  }, [legacy]);

  // The editor is a browser tool (canvas, pointer, saved view preferences), so it
  // is drawn only once the page is in the browser: rendered on the server, its
  // Radix ids never matched the client's (a hydration error on every open).
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (!inBrowser) return <div className="h-screen bg-background" />;

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
      trailing={
        // The dieline record (title, sizes it is sold in, materials, images): a dialog, not a tab.
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Dieline settings">
              <Settings2 />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Dieline settings</DialogTitle>
              <DialogDescription>Title, categories, images and the sizes, materials and dimension types this dieline is sold in.</DialogDescription>
            </DialogHeader>
            <DielineSettingsForm categories={categories} dieline={dieline} />
          </DialogContent>
        </Dialog>
      }
      settings={<PreviewSettings dieline={dieline} />}
      onSave={async (doc) => {
        const res = await saveDielineDocument(dieline.id, JSON.stringify(doc));
        if (res.ok) toast.success("Dieline saved");
        return res;
      }}
      onError={(message) => toast.error(message)}
    />
  );
}
