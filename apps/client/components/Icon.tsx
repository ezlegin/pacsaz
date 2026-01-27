import { ElementType } from "react";

const Icon = ({
  icon: Icon,
  size = 24,
  strokeWidth = 2,
}: {
  icon: ElementType;
  size?: number;
  strokeWidth?: number;
}) => (
  <div className="bg-primary/20 h-7 w-7 rounded-tr-2xl relative">
    <Icon
      className="absolute -top-2 -left-2 text-primary"
      size={size}
      strokeWidth={strokeWidth}
    />
  </div>
);

export default Icon;
