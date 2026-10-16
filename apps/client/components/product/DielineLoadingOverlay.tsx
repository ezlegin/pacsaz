"use client";

import { useAppSelector } from "@repo/store/hooks";
import { cn } from "@repo/ui/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export default function DielineLoadingOverlay({
  message = "در حال تولید دایلاین...",
  className,
}: LoadingOverlayProps) {
  const svg = useAppSelector((s) => s.svg.svg);

  const [isRenderingLoading, setIsRenderingLoading] = useState(true);

  useEffect(() => {
    if (svg) setIsRenderingLoading(false);
  }, [svg]);

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-700 ease-in-out",
        isRenderingLoading ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-background px-8 py-7 shadow-xl shadow-primary/10">
        <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25">
          <Sparkles className="size-5" strokeWidth={1.9} />
          <Loader2 className="absolute -bottom-1 -left-1 size-5 animate-spin rounded-full bg-background p-0.5 text-primary" />
        </span>

        <div className="space-y-1 text-center">
          <p className="text-xs font-bold">{message}</p>
          <p className="text-[10px] text-muted-foreground">
            محاسبات ابعاد و خطوط در حال انجام است
          </p>
        </div>
      </div>
    </div>
  );
}
