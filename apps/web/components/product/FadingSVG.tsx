import { cn } from "@repo/ui/lib/utils";
import { useState, useEffect } from "react";

export default function FadingSvg({
  svg,
  isRendering,
}: {
  svg: string;
  isRendering: boolean;
}) {
  const [displayedSvg, setDisplayedSvg] = useState(svg);
  const [prevSvg, setPrevSvg] = useState<string | null>(null);

  useEffect(() => {
    if (svg === displayedSvg) return;

    // keep previous SVG for fade-out
    setPrevSvg(displayedSvg);

    // fade in new SVG after next frame
    const raf = requestAnimationFrame(() => {
      setDisplayedSvg(svg);
    });

    return () => cancelAnimationFrame(raf);
  }, [svg, displayedSvg]);

  return (
    <div className="relative w-full h-full">
      {prevSvg && prevSvg !== displayedSvg && (
        <div
          dangerouslySetInnerHTML={{ __html: prevSvg }}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0"
          )}
        />
      )}
      {displayedSvg && (
        <div
          dangerouslySetInnerHTML={{ __html: displayedSvg }}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            isRendering ? "opacity-50" : "opacity-100"
          )}
        />
      )}
    </div>
  );
}
