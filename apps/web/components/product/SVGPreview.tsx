"use client";

import { onDevelepe } from "@/lib/dielines/core/consts";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import { ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function SvgPreview({
  svg,
  isRendering,
  initalScale = 1,
}: {
  svg: string;
  initalScale?: number;
  isRendering: boolean;
}) {
  return (
    <div className="relative flex justify-center items-center w-full h-full overflow-visible">
      <TransformWrapper
        panning={{ disabled: isRendering }}
        wheel={{ disabled: isRendering }}
        centerOnInit
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        maxScale={onDevelepe ? 10 : 3}
        minScale={0.3}
        smooth
        centerZoomedOut
        limitToBounds={false}
        onInit={({ centerView }) => {
          centerView(initalScale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "grab",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="relative">
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
