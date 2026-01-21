import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const NewButton = ({
  href = "",
  title = "New",
  className,
  icon = false,
}: {
  href?: string;
  title?: string;
  className?: string;
  icon?: boolean;
}) => {
  return (
    <Link href={href}>
      <Button className={`px-6 lg:px-7 ${className}`} variant={"default"}>
        {icon && <Plus />}
        {title}
      </Button>
    </Link>
  );
};

export default NewButton;
