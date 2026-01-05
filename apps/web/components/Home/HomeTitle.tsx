import { cn } from "@workspace/ui/lib/utils";

const HomeTitle = ({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div className={cn("space-y-2 text-center", className)}>
      <h2 className="font-semibold text-2xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default HomeTitle;
