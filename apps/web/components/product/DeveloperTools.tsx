import { onDevelepe } from "@repo/dieline-core/data/consts";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardTitle } from "@repo/ui/components/card";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

const DeveloperTools = () => {
  const {
    ctx: { showAnchors, showOverallDimensions, doCenterSVG, showWatermark },
    setDeveloperToolsCTX,
  } = useDeveloperToolsStore();
  const [open, setOpen] = useState(false);

  return (
    onDevelepe && (
      <div
        className={cn(
          open ? "translate-x-0" : "-translate-x-65",
          "absolute flex items-center left-0 bottom-0 w-fit m-3 transition-all"
        )}
      >
        <Button
          onClick={() => setOpen(!open)}
          className="rounded-l-none rounded-r-full bg-background text-foreground border border-l-0 hover:bg-background"
        >
          <ChevronRight />
        </Button>

        <Card dir="ltr" className="p-4 gap-1">
          <CardTitle>Developer Tools:</CardTitle>

          <CardContent className="p-1 text-sm flex flex-col gap-2">
            <div className="flex justify-between">
              <p>Show Anchors</p>
              <Switch
                checked={showAnchors}
                onCheckedChange={(val) =>
                  setDeveloperToolsCTX("showAnchors", val)
                }
              />
            </div>
            <div className="flex justify-between">
              <p>Show Watermark</p>
              <Switch
                checked={showWatermark}
                onCheckedChange={(val) =>
                  setDeveloperToolsCTX("showWatermark", val)
                }
              />
            </div>
            <div className="flex justify-between">
              <p>Show Overall Dimensions</p>
              <Switch
                checked={showOverallDimensions}
                onCheckedChange={(val) =>
                  setDeveloperToolsCTX("showOverallDimensions", val)
                }
              />
            </div>
            <div className="flex justify-between">
              <p>Do Center the SVG</p>
              <Switch
                checked={doCenterSVG}
                onCheckedChange={(val) =>
                  setDeveloperToolsCTX("doCenterSVG", val)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );
};

export default DeveloperTools;
