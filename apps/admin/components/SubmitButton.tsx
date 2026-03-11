import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import React from "react";

const SubmitButton = ({
  isLoading,
  form,
  label,
}: {
  isLoading: boolean;
  form: any;
  label: string;
}) => {
  return (
    <Button
      size={"lg"}
      disabled={!form.formState.isValid || !form.formState.isDirty}
      className="w-full"
    >
      <Spinner isLoading={isLoading} />
      {label}
    </Button>
  );
};

export default SubmitButton;
