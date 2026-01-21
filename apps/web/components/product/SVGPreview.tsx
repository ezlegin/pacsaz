"use client";
import { onDevelepe } from "@repo/dieline-core/data/consts";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Spinner } from "@repo/ui/components/spinner";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

interface Props {
  svg: string;
  isRendering: boolean;
  doCenterSVG: boolean;
  disablePanning?: boolean;
  disableWheel?: boolean;
  showControls?: boolean;
}

export default function SvgPreview({
  svg,
  isRendering,
  doCenterSVG,
  disablePanning = false,
  disableWheel = false,
  showControls = true,
}: Props) {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>();

  console.log(doCenterSVG);

  useLayoutEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;

    const measureAndCenter = () => {
      const content = contentRef.current!;
      const wrapper = wrapperRef.current!;

      const contentHeight = content.clientHeight;
      const contentWidth = content.clientWidth;

      const wrapperHeight = wrapper.clientHeight;
      const wrapperWidth = wrapper.clientWidth;

      if (!contentHeight || !contentWidth) return;

      const scaleX = wrapperWidth / contentWidth;
      const scaleY = wrapperHeight / contentHeight;
      const nextScale = Math.min(scaleX, scaleY);

      setScale(nextScale);

      if (isFinite(nextScale) && nextScale > 0 && doCenterSVG) {
        transformRef.current?.centerView(nextScale, 0);
      }
    };

    measureAndCenter();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measureAndCenter);
    });

    resizeObserver.observe(wrapperRef.current);
    resizeObserver.observe(contentRef.current);

    const images = Array.from(contentRef.current.querySelectorAll("img"));
    images.forEach((img) => img.addEventListener("load", measureAndCenter));

    return () => {
      resizeObserver.disconnect();
      images.forEach((img) =>
        img.removeEventListener("load", measureAndCenter)
      );
    };
  }, [svg, doCenterSVG]);

  return (
    <div
      ref={wrapperRef}
      dir="ltr"
      className="h-full flex items-center justify-center"
    >
      <TransformWrapper
        // key={doCenterSVG ? svg : undefined}
        ref={transformRef}
        centerOnInit
        limitToBounds={false}
        minScale={0.5}
        maxScale={onDevelepe ? 10 : 1.8}
        panning={{ disabled: isRendering || disablePanning }}
        wheel={{
          disabled: isRendering || disableWheel,
          smoothStep: onDevelepe ? 0.002 : 0.0003,
        }}
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        smooth
        centerZoomedOut
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                cursor: disablePanning ? "auto" : "grab",
                overflow: "visible",
              }}
            >
              <div className="relative" ref={contentRef}>
                {isRendering && (
                  <Spinner className="scale-200 text-primary absolute top-1/2 -translate-y-1/2 left-1/2 translate-x-1/2" />
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: svg }}
                  className={isRendering ? "opacity-50" : "opacity-100"}
                />
              </div>
            </TransformComponent>

            {showControls && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Card className="flex-row items-center gap-2 p-1 text-muted-foreground">
                  <Button variant="ghost" onClick={() => zoomOut(0.4)}>
                    <ZoomOut size={20} />
                  </Button>
                  <div className="h-5">
                    <Separator orientation="vertical" />
                  </div>
                  <Button variant="ghost" onClick={() => centerView(scale)}>
                    ریست
                  </Button>
                  <div className="h-5">
                    <Separator orientation="vertical" />
                  </div>
                  <Button variant="ghost" onClick={() => zoomIn(0.4)}>
                    <ZoomIn size={20} />
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
