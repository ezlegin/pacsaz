"use client";

import { Card } from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export default function LoadingOverlay({
  isLoading,
  message = "در حال تولید...",
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center bg-accent/20 backdrop-blur-xs transition-opacity duration-700 ease-in-out",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        className
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
