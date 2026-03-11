import { onDevelepe } from "@repo/lib/data/consts";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { Switch } from "@repo/ui/components/switch";

const DeveloperTools = () => {
  const {
    developerTools: { showAnchors, doCenterSVG, showWatermark },
    setDeveloperTools: setDeveloperToolsCTX,
  } = useDeveloperToolsStore();

  return (
    onDevelepe && (
      <div className="p-1 text-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Show Anchors</p>
          <Switch
            checked={showAnchors}
            onCheckedChange={(val) => setDeveloperToolsCTX("showAnchors", val)}
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
          <p>Do Center the SVG</p>
          <Switch
            checked={doCenterSVG}
            onCheckedChange={(val) => setDeveloperToolsCTX("doCenterSVG", val)}
          />
        </div>
      </div>
    )
  );
};

export default DeveloperTools;
