"use client";
import { onDevelepe } from "@/lib/dielines/core/consts";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export default function Page() {
  const tranformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const height = 2;

  useEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;

    const contentHeight = contentRef.current.clientHeight;
    const wrapperHeight = wrapperRef.current.clientHeight;
    const scaleY = wrapperHeight / contentHeight;

    const contentWidth = contentRef.current.clientWidth;
    const wrapperWidth = wrapperRef.current.clientWidth;
    const scaleX = wrapperWidth / contentWidth;

    const chosenScale = Math.min(scaleX, scaleY);

    const scalePadding =
      scaleY <= scaleX
        ? 0.2 * scaleY // Y Padding
        : 0.4 * scaleX; // X Padding

    const scale = chosenScale - scalePadding;

    tranformRef.current?.centerView(scale);
  }, [height]);

  return (
    <div
      ref={wrapperRef}
      dir="ltr"
      className="h-screen w-screen flex items-center justify-center"
    >
      <TransformWrapper
        ref={tranformRef}
        centerOnInit
        limitToBounds={false}
        minScale={0.5}
        maxScale={onDevelepe ? 10 : 3}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                background: "red",
                overflow: "hidden",
              }}
              contentStyle={{ background: "blue" }}
            >
              <div
                ref={contentRef}
                className={`bg-amber-300 rounded-full w-[500px] text-center p-10`}
              >
                Content
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
