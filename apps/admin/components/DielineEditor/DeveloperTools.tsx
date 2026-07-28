import { onDevelepe } from "@repo/lib/data/consts";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { Switch } from "@repo/ui/components/switch";

const DeveloperTools = () => {
  const dispatch = useAppDispatch();
  const { showAnchors, doCenterSVG, showWatermark } = useAppSelector(
    (s) => s.developerTools,
  );
  return (
    onDevelepe && (
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
    )
  );
};

export default DeveloperTools;
