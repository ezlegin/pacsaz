import { cn } from "@repo/ui/lib/utils";
import Card from "@repo/ui/components/custom/Card";

export const StatCard = ({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  className?: string;
}) => (
  <Card
    className={cn(
      "flex justify-between items-center text-sm font-medium text-muted-foreground",
      className
    )}
  >
    <div>
      <div>{title}</div>
      <div className="text-lg text-foreground font-medium">{value}</div>
    </div>

    <div className="bg-primary/20 h-7 w-7 rounded-tr-2xl relative">
      <Icon
        className="absolute -top-3 -left-3 text-primary"
        size={32}
        strokeWidth={1.5}
      />
    </div>
  </Card>
);
