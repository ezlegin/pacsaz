"use client";
import { onDevelepe } from "@/lib/dielines/core/consts";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export default function SvgPreview({
  svg,
  isRendering,
}: {
  svg: string;
  isRendering: boolean;
}) {
  const tranformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;

    const measureAndCenter = () => {
      const contentHeight = contentRef.current!.clientHeight || 1;
      const wrapperHeight = wrapperRef.current!.clientHeight || 1;
      const scaleY = wrapperHeight / contentHeight;

      const contentWidth = contentRef.current!.clientWidth || 1;
      const wrapperWidth = wrapperRef.current!.clientWidth || 1;
      const scaleX = wrapperWidth / contentWidth;

      const scale = Math.min(scaleX, scaleY);
      if (isFinite(scale) && scale > 0) {
        tranformRef.current?.centerView(scale);
      }
    };

    const raf = requestAnimationFrame(measureAndCenter);

    const imgs = Array.from(contentRef.current.querySelectorAll("img"));
    const onImgLoad = () => requestAnimationFrame(measureAndCenter);
    imgs.forEach((i) => i.addEventListener("load", onImgLoad));

    return () => {
      cancelAnimationFrame(raf);
      imgs.forEach((i) => i.removeEventListener("load", onImgLoad));
    };
  }, [svg]);

  return (
    <div
      ref={wrapperRef}
      dir="ltr"
      className="h-full w-screen flex items-center justify-center"
    >
      <TransformWrapper
        key={svg}
        ref={tranformRef}
        centerOnInit
        limitToBounds={false}
        minScale={0.5}
        maxScale={onDevelepe ? 10 : 3}
        panning={{ disabled: isRendering }}
        wheel={{ disabled: isRendering }}
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        smooth
        centerZoomedOut
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
            >
              <div className="relative pb-20 " ref={contentRef}>
                {isRendering && (
                  <Spinner className="scale-200 text-primary absolute top-1/2 translate-y-1/2 left-1/2 translate-x-1/2" />
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: svg }}
                  className={isRendering ? "opacity-50" : "opacity-100"}
                />
              </div>
            </TransformComponent>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Card className="flex-row items-center gap-3 p-1">
                <Button variant="ghost" onClick={() => zoomIn(0.2)}>
                  <ZoomIn size={20} />
                </Button>
                <div className="h-5">
                  <Separator orientation="vertical" />
                </div>
                <Button variant="ghost" onClick={() => resetTransform()}>
                  ریست
                </Button>
                <div className="h-5">
                  <Separator orientation="vertical" />
                </div>
                <Button variant="ghost" onClick={() => zoomOut(0.2)}>
                  <ZoomOut size={20} />
                </Button>
              </Card>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
