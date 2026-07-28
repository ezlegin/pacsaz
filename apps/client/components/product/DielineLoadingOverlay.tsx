"use client";

import { useAppSelector } from "@repo/store/hooks";
import { Card } from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export default function DielineLoadingOverlay({
  message = "در حال تولید...",
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
        "absolute inset-0 z-20 flex items-center justify-center bg-accent/20 backdrop-blur-xs transition-opacity duration-700 ease-in-out",
        isRenderingLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        className,
      )}
    >
      <Card className="p-3 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          {message}
        </div>
      </Card>
    </div>
  );
}
