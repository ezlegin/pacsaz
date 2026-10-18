"use client";

import {
  defaultArtworkTransform,
  type ArtworkTransform,
} from "@repo/dieline-3d/geometry";
import { DielineViewer, type ViewerEmptyReason } from "@repo/dieline-3d/viewer";
import { useAppSelector } from "@repo/store/hooks";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Lock,
  Maximize2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UserType } from "./DielineDownloadButton";
import FoldedIcon from "../FoldedIcon";
import UnfoldedIcon from "../UnfoldedIcon";
import ArtworkPlacer from "./ArtworkPlacer";

/**
 * Previewing artwork on the 3D model is a paid capability.
 *
 * Decided from the active plan's key rather than an ad-hoc flag, so it follows the
 * pricing tiers directly: `standard` does not include it, `pro` and `organization`
 * do. Nothing is enforced server-side because the feature is preview-only and the
 * image never leaves the browser.
 */
const ARTWORK_PLAN_KEYS = ["pro", "organization"] as const;

const canUseArtwork = (user: UserType | null): boolean =>
  Boolean(
    user?.plan &&
      ARTWORK_PLAN_KEYS.includes(
        user.plan.key as (typeof ARTWORK_PLAN_KEYS)[number],
      ),
  );

/** Persian copy for the shared viewer's empty states. */
const emptyMessage = (reason: ViewerEmptyReason) => {
  const message =
    reason === "pending"
      ? "در حال تولید دایلاین..."
      : reason === "no-geometry"
        ? "هندسه‌ی دایلاین خوانده نشد. صفحه را دوباره بارگذاری کن."
        : "ساخت مدل سه‌بعدی ناموفق بود.";

  return (
    <div className="flex items-center justify-center bg-muted/20 px-4 py-10 text-center">
      <p className="text-[11px] leading-6 text-muted-foreground">{message}</p>
    </div>
  );
};

type Artwork = { url: string; name: string; transform: ArtworkTransform };

/**
 * Live 3D preview of the current dieline, with a larger split view for artwork.
 *
 * The dialog pairs the model on the left with artwork preparation on the right, so
 * dragging the image on the flat dieline updates the folded model in place instead
 * of round-tripping through a separate step. Placement is stored as a transform,
 * never baked into pixels, so it stays editable.
 *
 * Everything here is view state and never dispatches. The image is a local object
 * URL held in memory for the session — never uploaded, revoked when replaced.
 */
const DielinePreview3D = ({
  isRendering,
  user,
  className,
}: {
  /** Comes from the generator's transition, not from the store. */
  isRendering: boolean;
  /** Used to decide whether artwork preview is unlocked for this plan. */
  user: UserType | null;
  className?: string;
}) => {
  const [progress, setProgress] = useState(1);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [hasHinges, setHasHinges] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  /** Shown when a user whose plan lacks artwork preview tries to upload. */
  const [locked, setLocked] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const artworkUnlocked = canUseArtwork(user);

  /** Single entry point for choosing a file, so the plan gate cannot be bypassed. */
  const requestArtwork = () => {
    if (!artworkUnlocked) {
      setLocked(true);
      return;
    }

    fileInput.current?.click();
  };

  const svg = useAppSelector((s) => s.svg.svg);
  const material = useAppSelector((s) => s.dielineSettings.material.value);
  const thickness = useAppSelector((s) => s.dielineSettings.thickness);
  const foldConfig = useAppSelector((s) => s.dielineSettings.foldConfig);

  /**
   * Free the blob URL when it is replaced, and on unmount.
   *
   * Depends on the URL string, not on the artwork object: dragging replaces the
   * object on every pointer move, and depending on the object would revoke a URL
   * that is still in use — the texture would fail to decode and never recover.
   */
  useEffect(() => {
    const url = artwork?.url;
    if (!url) return;

    return () => URL.revokeObjectURL(url);
  }, [artwork?.url]);

  const percent = Math.round(progress * 100);

  const pickArtwork = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    setArtwork({
      url: URL.createObjectURL(file),
      name: file.name,
      transform: defaultArtworkTransform(),
    });
  };

  const viewerArtwork = artwork
    ? { url: artwork.url, transform: artwork.transform }
    : null;

  /** Slider and expand button, flush beneath the canvas. */
  const controls = (extra?: React.ReactNode) => (
    <div className="flex items-center gap-2 border-t bg-background px-2.5 py-2">
      {hasHinges ? (
        <>
          <UnfoldedIcon className="size-4.5 shrink-0 text-primary" />

          <input
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setProgress(Number(e.target.value) / 100)}
            aria-label="میزان تا شدن جعبه"
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
          />

          <FoldedIcon className="size-4.5 shrink-0 text-primary" />
        </>
      ) : (
        <span className="min-w-0 flex-1 text-[10px] text-muted-foreground">
          این دایلاین خط تا ندارد؛ مدل به‌صورت صاف نمایش داده می‌شود.
        </span>
      )}

      {extra}
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-background",
          className,
        )}
      >
        <DielineViewer
          svg={svg ?? ""}
          material={material}
          thickness={thickness}
          progress={progress}
          isRendering={isRendering}
          foldConfig={foldConfig}
          artwork={viewerArtwork}
          renderEmpty={emptyMessage}
          onModelInfo={(info) => setHasHinges(info.hasHinges)}
          className="h-52 w-full"
        />

        {controls(
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="نمایش بزرگ مدل سه‌بعدی"
            title="نمایش بزرگ"
            className="grid size-7 shrink-0 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Maximize2 className="size-3.5" />
          </button>,
        )}
      </div>

      {/* ----------------------------- split view ------------------------------ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-6xl">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>نمای سه‌بعدی</DialogTitle>
            <DialogDescription>
              برای چرخش بکش، برای بزرگ‌نمایی اسکرول کن. تصویر انتخابی فقط
              پیش‌نمایش است و آپلود یا ذخیره نمی‌شود.
            </DialogDescription>
          </DialogHeader>

          {/*
            Left is the model, right is artwork preparation. The two panels are
            tinted differently so the eye separates "what it looks like" from
            "what goes on it".
          */}
          <div className="grid gap-3 p-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {/* --------------------------- artwork ----------------------------- */}
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-xl border bg-muted/50 p-3">
              <div>
                <p className="text-xs font-bold">تصویر طرح</p>
                <p className="text-[10px] leading-5 text-muted-foreground">
                  تصویر روی الگوی صاف چاپ می‌شود و با تا شدن همراه مدل حرکت
                  می‌کند.
                </p>
              </div>

              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  pickArtwork(e.target.files?.[0]);
                  // Allow re-picking the same file.
                  e.target.value = "";
                }}
              />

              {artwork ? (
                <>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.url}
                      alt=""
                      className="size-10 shrink-0 rounded-md border bg-white object-cover"
                    />

                    <p
                      className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground"
                      title={artwork.name}
                    >
                      {artwork.name}
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setArtwork(null)}
                      aria-label="حذف تصویر"
                      title="حذف تصویر"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <ArtworkPlacer
                    svg={svg ?? ""}
                    imageUrl={artwork.url}
                    value={artwork.transform}
                    onChange={(transform) =>
                      setArtwork((current) =>
                        current ? { ...current, transform } : current,
                      )
                    }
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-auto"
                    onClick={requestArtwork}
                  >
                    <ImagePlus className="size-3.5" />
                    تغییر تصویر
                  </Button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={requestArtwork}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (artworkUnlocked) setHovering(true);
                  }}
                  onDragLeave={() => setHovering(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHovering(false);

                    if (!artworkUnlocked) {
                      setLocked(true);
                      return;
                    }

                    pickArtwork(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 text-center transition-colors",
                    hovering
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/40 hover:bg-primary/[0.04]",
                  )}
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ImagePlus className="size-4.5" />
                  </span>

                  <span className="text-xs font-bold">
                    تصویر طرح را انتخاب کن
                  </span>
                  <span className="text-[10px] leading-5 text-muted-foreground">
                    PNG یا JPG — می‌توانی فایل را همین‌جا رها کنی.
                    <br />
                    فقط پیش‌نمایش، بدون آپلود.
                  </span>
                </button>
              )}
            </div>

            {/* --------------------------- viewport ---------------------------- */}
            <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
              <DielineViewer
                svg={svg ?? ""}
                material={material}
                thickness={thickness}
                progress={progress}
                isRendering={isRendering}
                foldConfig={foldConfig}
                artwork={viewerArtwork}
                renderEmpty={emptyMessage}
                onModelInfo={(info) => setHasHinges(info.hasHinges)}
                className="h-[58vh] w-full"
              />

              {controls()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/*
        Plan gate. A small dialog rather than a locked panel, so the upload
        affordance stays normal and the requirement is explained only when someone
        actually reaches for it.
      */}
      <Dialog open={locked} onOpenChange={setLocked}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>قابلیت پلن حرفه‌ای و سازمانی</DialogTitle>
            <DialogDescription>
              دیدن طرح روی مدل سه‌بعدی در پلن حرفه‌ای و سازمانی فعال است.
            </DialogDescription>
          </DialogHeader>

          {/* ------------------------------ hero ------------------------------- */}
          <div className="relative overflow-hidden bg-gradient-to-bl from-violet-500 via-purple-600 to-indigo-600 px-5 pb-6 pt-7">
            {/* Masked grid, echoing the login card. */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full opacity-[0.16]"
            >
              <defs>
                <pattern
                  id="locked-grid"
                  width="26"
                  height="26"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M26 0H0V26"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#locked-grid)" />
            </svg>

            {/* Glow blooms. */}
            <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-white/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 size-36 rounded-full bg-fuchsia-300/30 blur-3xl" />

            <button
              type="button"
              onClick={() => setLocked(false)}
              aria-label="بستن"
              className="absolute left-3 top-3 grid size-7 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur transition-colors hover:bg-white/25"
            >
              <X className="size-3.5" />
            </button>

            <div className="relative flex flex-col items-center gap-3 text-center">
              <span className="relative grid size-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/30 backdrop-blur">
                <Lock className="size-6" strokeWidth={2.2} />
                <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-white text-violet-600 shadow-sm">
                  <Sparkles className="size-3.5" strokeWidth={2.4} />
                </span>
              </span>

              <div className="space-y-1">
                <p className="text-base font-extrabold text-white">
                  ویژه‌ی پلن حرفه‌ای و سازمانی
                </p>
                <p className="mx-auto max-w-xs text-[11px] leading-6 text-white/85">
                  طرح خودت را روی مدل سه‌بعدی ببین؛ زنده، چرخان و همان‌قدر واقعی
                  که پیش از چاپ مطمئن شوی.
                </p>
              </div>
            </div>
          </div>

          {/* ---------------------------- benefits ----------------------------- */}
          <ul className="space-y-2.5 px-5 py-5">
            {[
              "بارگذاری تصویر و دیدن آن روی مدل سه‌بعدی",
              "جابه‌جایی و تغییر اندازه‌ی طرح روی الگو",
              "پیش‌نمایش چرخان و قابل بزرگ‌نمایی بسته",
            ].map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-[11px] leading-6"
              >
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* ----------------------------- actions ----------------------------- */}
          <div className="flex items-center gap-2 border-t bg-muted/40 px-5 py-3.5">
            <Button
              asChild
              className="group flex-1 bg-gradient-to-l from-violet-500 to-purple-600 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
            >
              <Link href="/subscription">
                <Sparkles className="size-3.5" />
                ارتقای پلن
                <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocked(false)}
            >
              بعداً
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DielinePreview3D;
