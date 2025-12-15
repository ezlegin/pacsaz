import M from "makerjs";
import { DielineDefinition } from "../../core/types";

export const postalCard: DielineDefinition = {
  slug: "postal-card",
  title: "کارت پستال دو برگ",
  defaultDimensions: {
    length: 160,
    width: 90,
    height: 0,
  },
  model({ width, length }) {
    const model: M.IModel = { models: {} };
    const rect = new M.models.Rectangle(width * 2, length);

    //! BLEED
    model.models!["bleed"] = M.model.outline(rect, 3, 1);
    model.models!["bleed"].layer = "bleed";

    //! TRIM
    const trim = rect;
    model.models!["trim"] = trim;
    model.models!["trim"].layer = "trim";

    //! FOLD
    const fold = new M.models.ConnectTheDots(false, [
      [width, 0],
      [width, length],
    ]);
    model.models!["fold"] = fold;
    model.models!["fold"].layer = "fold";

    //! GUIDES
    const pointer = new M.models.Polygon(3, 1.2);
    model.models!["pointer"] = M.model.move(pointer, [width - 1.2, length / 4]);
    model.models!["pointer"].layer = "widthGuideText";

    const widthLeftPointer = M.cloneObject(pointer);
    model.models!["widthLeftPointer"] = M.model.mirror(
      M.model.move(M.model.center(widthLeftPointer), [-1.2, length / 4]),
      true,
      false
    );

    const lengthBottomPointer = M.cloneObject(pointer);
    model.models!["lengthBottomPointer"] = M.model.move(
      M.model.rotate(M.model.center(lengthBottomPointer), -90),
      [width / 4 - 0.3, 1.2]
    );

    const lengthTopPointer = M.cloneObject(pointer);
    model.models!["lengthTopPointer"] = M.model.move(
      M.model.rotate(M.model.center(lengthTopPointer), 90),
      [width / 4 - 0.3, length - 1.2]
    );

    const widthGuideLine = new M.models.ConnectTheDots(false, [
      [0, length / 4],
      [width, length / 4],
    ]);
    model.models!["widthGuideLine"] = widthGuideLine;
    model.models!["widthGuideLine"].layer = "widthGuideLine";

    const widthGuideBox = new M.models.Rectangle(18, 6);
    M.model.move(widthGuideBox, [width / 2 - 9, length / 4 - 3]);
    model.models!["widthGuideBox"] = widthGuideBox;
    model.models!["widthGuideBox"].layer = "widthGuideBox";

    const widthGuideText = M.cloneObject(widthGuideLine);
    M.model.addCaption(widthGuideText, `${width} mm`, [width / 2, length / 4]);
    model.models!["widthGuideText"] = widthGuideText;
    model.models!["widthGuideText"].layer = "widthGuideText";

    const lengthGuideLine = new M.models.ConnectTheDots(false, [
      [width / 4, 0],
      [width / 4, length],
    ]);
    model.models!["lengthGuideLine"] = lengthGuideLine;
    model.models!["lengthGuideLine"].layer = "lengthGuideLine";

    const lengthGuideBox = new M.models.Rectangle(18, 6);
    M.model.move(lengthGuideBox, [width / 4 - 9, length / 2 - 3]);
    model.models!["lengthGuideBox"] = lengthGuideBox;
    model.models!["lengthGuideBox"].layer = "lengthGuideBox";

    const lengthGuideText = M.cloneObject(lengthGuideLine);
    M.model.addCaption(lengthGuideText, `${length} mm`, [
      width / 4,
      length / 2,
    ]);
    model.models!["lengthGuideText"] = lengthGuideText;
    model.models!["lengthGuideText"].layer = "lengthGuideText";

    return M.exporter.toSVG(model, {
      units: "mm",
      layerOptions: {
        bleed: { stroke: "green", fill: "white" },
        trim: { stroke: "blue" },
        fold: { stroke: "red", cssStyle: "stroke-dasharray:5,2;" },
        widthGuideBox: { fill: "white", stroke: "none" },
        lengthGuideBox: { fill: "white", stroke: "none" },
        widthGuideLine: { stroke: "dodgerBlue" },
        lengthGuideLine: { stroke: "dodgerBlue" },
        widthGuideText: {
          stroke: "none",
          fill: "dodgerBlue",
          cssStyle: "font-size: 4; direction: ltr",
        },
        lengthGuideText: {
          stroke: "none",
          fill: "dodgerBlue",
          cssStyle: "font-size: 4; direction: ltr",
        },
      },
    });
  },
};
