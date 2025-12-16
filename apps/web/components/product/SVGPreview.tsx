"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function SvgPreview({
  svg,
  initalScale = 1,
}: {
  svg: string;
  initalScale?: number;
}) {
  return (
    <div className="relative flex justify-center items-center w-full h-full overflow-visible">
      <TransformWrapper
        centerOnInit
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        maxScale={3}
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
              <div dangerouslySetInnerHTML={{ __html: svg }} />
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
