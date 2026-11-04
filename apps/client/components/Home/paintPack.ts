import type { BoxSize } from "@/lib/dieline/homeBox";
import type { PrintFrame } from "@repo/dieline-3d/stage";
import { fa } from "./format";

const FONT = "KalamehWebFaNum, KalamehWeb, sans-serif";

/**
 * The design on the showcase box: the brand on its two wide panels and the
 * visitor's size at the foot. White board prints deep violet; flute is left bare
 * kraft and takes dark ink, as corrugated usually does.
 */
export const paintPack = (size: BoxSize, kraft: boolean) => (context: CanvasRenderingContext2D, frame: PrintFrame) => {
  const { width, height, panels } = frame;
  const ink = kraft ? "#2e1065" : "#ffffff";

  if (kraft) {
    context.fillStyle = "#c8a273";
  } else {
    const wash = context.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, "#4c1d95");
    wash.addColorStop(0.5, "#6d28d9");
    wash.addColorStop(1, "#3b1782");
    context.fillStyle = wash;
  }
  context.fillRect(0, 0, width, height);

  for (const panel of panels) {
    const cx = panel.x + panel.width / 2;
    const unit = Math.min(panel.width, panel.height);

    context.strokeStyle = ink;
    context.globalAlpha = 0.16;
    context.lineWidth = Math.max(1.5, unit / 240);
    for (let ring = 1; ring <= 10; ring++) {
      context.beginPath();
      context.arc(cx, panel.y + panel.height, (ring * unit) / 3.4, 0, Math.PI * 2);
      context.stroke();
    }
    context.globalAlpha = 1;

    context.fillStyle = ink;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.direction = "rtl";
    // Top and foot of the panel: a template may cut a window out of the middle.
    context.font = `800 ${unit * 0.22}px ${FONT}`;
    context.fillText("پک‌ساز", cx, panel.y + panel.height * 0.2);

    context.direction = "ltr";
    context.font = `500 ${unit * 0.065}px ${FONT}`;
    context.fillText(`${fa(size.width)} × ${fa(size.length)} × ${fa(size.height)} mm`, cx, panel.y + panel.height * 0.88);
  }
};

/**
 * The sheet under the print: the real cut and fold lines, drawn on clean white board,
 * in the dieline's own coordinates so they land exactly on the model's edges.
 */
export const paintBlueprint = (cuts: string, folds: string) => (context: CanvasRenderingContext2D, frame: PrintFrame) => {
  context.fillStyle = "#fbfaff";
  context.fillRect(0, 0, frame.width, frame.height);

  context.save();
  context.scale(frame.scale, frame.scale);
  context.translate(-frame.originX, -frame.originY);
  context.lineWidth = 2.2 / frame.scale;

  context.strokeStyle = "#1e1538";
  context.stroke(new Path2D(cuts));

  context.strokeStyle = "#7c3aed";
  context.setLineDash([9 / frame.scale, 7 / frame.scale]);
  context.stroke(new Path2D(folds));
  context.restore();
};
