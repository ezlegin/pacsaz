import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { Switch } from "@repo/ui/components/switch";
import { Separator } from "@repo/ui/components/separator";

/**
 * Dieline authoring helpers (anchors, watermark, centring).
 *
 * These are "developer tools" in the sense of building a dieline, not of coding,
 * so they are shown in every environment rather than gated behind NODE_ENV.
 */
const DeveloperTools = () => {
  const dispatch = useAppDispatch();
  const { showAnchors, doCenterSVG, showWatermark } = useAppSelector(
    (s) => s.developerTools,
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Dieline Tools</p>

      <div className="p-1 text-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Show Anchors</p>
          <Switch
            checked={showAnchors}
            onCheckedChange={(val) =>
              dispatch(setDeveloperTool({ key: "showAnchors", value: val }))
            }
          />
        </div>
        <div className="flex justify-between">
          <p>Show Watermark</p>
          <Switch
            checked={showWatermark}
            onCheckedChange={(val) =>
              dispatch(setDeveloperTool({ key: "showWatermark", value: val }))
            }
          />
        </div>
        <div className="flex justify-between">
          <p>Do Center the SVG</p>
          <Switch
            checked={doCenterSVG}
            onCheckedChange={(val) =>
              dispatch(setDeveloperTool({ key: "doCenterSVG", value: val }))
            }
          />
        </div>
      </div>

      <Separator />
    </div>
  );
};

export default DeveloperTools;
