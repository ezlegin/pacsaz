import Link from "next/link";
import React from "react";
import { Button } from "@repo/ui/components/button";

const NewButton = ({
  href = "",
  title = "New",
  className,
}: {
  href?: string;
  title?: string;
  className?: string;
}) => {
  return (
    <Link href={href}>
      <Button className={`px-6 lg:px-7 ${className}`} variant={"default"}>
        {title}
      </Button>
    </Link>
  );
};

export default NewButton;
