import { ISpec } from "@repo/store/types";
import {
  ChevronRight,
  Circle,
  Hexagon,
  Minus,
  Parentheses,
  Square,
} from "lucide-react";

export function LayerIcon({ data }: { data: ISpec.ShapesKey }) {
  const cls = "scale-[0.6]";
  switch (data) {
    case "line":
      return <Minus className={cls} />;
    case "circle":
      return <Circle className={cls} />;
    case "rectangle":
      return <Square className={cls} />;
    case "lines":
      return <ChevronRight className={cls} />;
    case "polygon":
      return <Hexagon className={cls} />;
    case "arc":
      return <Parentheses className={cls} />;
  }
}
