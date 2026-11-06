import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import React from "react";

const SubmitButton = ({
  isLoading,
  form,
  label,
  className,
}: {
  isLoading: boolean;
  form: any;
  label: string;
  className?: string;
}) => {
  return (
    <Button
      size={"lg"}
      type="submit"
      // Disabled while saving too: a second click used to submit again, which
      // for a payment means a second payment and subscription.
      disabled={isLoading || !form.formState.isValid || !form.formState.isDirty}
      className={cn("w-full", className)}
    >
      <Spinner isLoading={isLoading} />
      {label}
    </Button>
  );
};

export default SubmitButton;
