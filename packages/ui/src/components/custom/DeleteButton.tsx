import { cn } from "../../lib/utils";
import { Button } from "../button";

const DeleteButton = ({
  lang = "en",
  size = "lg",
  className,
}: {
  lang?: "fa" | "en";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) => {
  return (
    <Button
      size={size}
      variant={"destructive"}
      className={cn("w-full", className)}
    >
      {lang === "en" ? "Delete" : "حذف"}
    </Button>
  );
};

export default DeleteButton;
