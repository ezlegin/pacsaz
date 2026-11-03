"use client";

import { saveDielineDocument } from "@/actions/dieline";
import type { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import type { DielineDocument } from "@repo/dieline-engine";
import { EditorStore, Studio } from "@repo/editor";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
      leading={
        <Button variant="ghost" size="icon" asChild title="Back to dielines">
          <Link href="/dielines">
            <ArrowLeft />
          </Link>
        </Button>
      }
      trailing={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings /> Details
            </Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false} overlayClassname="backdrop-blur-xs bg-transparent" className="min-w-3xl">
            <DialogTitle className="sr-only">Dieline details</DialogTitle>
            <DielineSettingsForm categories={categories} dieline={dieline} />
          </DialogContent>
        </Dialog>
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
