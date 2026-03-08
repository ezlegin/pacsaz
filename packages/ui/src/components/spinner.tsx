import { Loader2Icon } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";

function Spinner({
  isLoading,
  className,
  ...props
}: React.ComponentProps<"svg"> & { isLoading: boolean }) {
  if (isLoading)
    return (
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
    );
}

export { Spinner };
