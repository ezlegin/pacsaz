"use client";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { Ruler, ZoomIn, ZoomOut } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSetting } from "@repo/store/slices/dielineSettingsSlice";

interface Props {
  isRendering: boolean;
  disablePanning?: boolean;
  disableWheel?: boolean;
  showControls?: boolean;
  type: "editor" | "client";
}

export default function SvgPreview({
  isRendering,
  type,
  disablePanning = false,
  disableWheel = false,
  showControls = true,
}: Props) {
  const isEditorType = type === "editor";

  let svg = useAppSelector((s) => s.svg.svg);
  const doCenterSVG = useAppSelector((s) => s.developerTools.doCenterSVG);
  const dispatch = useAppDispatch();

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>();
  const [scaleFraction, setScaleFraction] = useState(1);
  const settings = useAppSelector((s) => s.dielineSettings);

  useLayoutEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;
    setScaleFraction(1);

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
      const scale = Math.min(scaleX, scaleY);

      setScale(scale);

      if (isFinite(scale) && scale > 0 && doCenterSVG) {
        transformRef.current?.centerView(scale, 0);
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
        img.removeEventListener("load", measureAndCenter),
      );
    };
  }, [svg, doCenterSVG]);

  const handleRulers = () => {
    dispatch(
      setSetting({
        key: "showOverallRulers",
        value: !settings.showOverallRulers,
      }),
    );
  };

  const getScaleFraction = (containerScale: number) => {
    if (!scale) return;
    const scaleFraction = containerScale / scale;
    setScaleFraction(scaleFraction);
  };

  svg = scaleSVGStrokeWidth(svg!, scaleFraction);

  return (
    <div
      ref={wrapperRef}
      dir="ltr"
      className="h-full flex items-center justify-center"
    >
      <TransformWrapper
        ref={transformRef}
        centerOnInit
        limitToBounds={false}
        minScale={0.05}
        maxScale={isEditorType ? 3 : 1.5}
        panning={{ disabled: isRendering || disablePanning }}
        wheel={{
          disabled: isRendering || disableWheel,
        }}
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        smooth
        centerZoomedOut
        onZoom={(ref) => {
          const scale = ref.state.scale;
          getScaleFraction(scale);
        }}
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
                  dangerouslySetInnerHTML={{ __html: svg! }}
                  className={isRendering ? "opacity-50" : "opacity-100"}
                />
              </div>
            </TransformComponent>

            {showControls && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
                <Card className="flex-row items-center gap-1 p-1 text-muted-foreground">
                  <Button
                    className={cn(
                      settings.showOverallRulers
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                    variant="ghost"
                    size={"icon"}
                    title="خطکش ها"
                    onClick={() => handleRulers()}
                  >
                    <Ruler />
                  </Button>
                  <div className="h-5">
                    <Separator orientation="vertical" />
                  </div>
                  <Button variant="ghost" onClick={() => zoomOut(0.4)}>
                    <ZoomOut size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      centerView(scale);
                      setScaleFraction(1);
                    }}
                  >
                    ریست
                  </Button>
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

function scaleSVGStrokeWidth(svg: string, newSclaeAmount: number) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg!, "image/svg+xml");

  const group = doc.getElementById("svgGroup");

  if (group) {
    const originalStrokeWidth = Number(group.getAttribute("stroke-width"));
    const newStrokeWidth = String(originalStrokeWidth / newSclaeAmount);
    group.setAttribute("stroke-width", newStrokeWidth);

    const currentStyle = group.getAttribute("style") || "";
    if (currentStyle.includes("stroke-width")) {
      const newStyle = currentStyle.replace(
        /stroke-width:[^;]+/,
        `stroke-width:${newStrokeWidth}`,
      );
      group.setAttribute("style", newStyle);
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}
