import { pacsazLogoIcon, pacsazLogoFull } from "@/public";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import React from "react";

const PacsazLogo = ({
  type = "icon",
  grayout,
  scale = 1,
}: {
  type?: "icon" | "full";
  grayout?: boolean;
  scale?: number;
}) => {
  const styles = cn(
    "select-none",
    grayout ? "saturate-0 hover:saturate-100 transition-all" : "saturate-100"
  );
  return type === "icon" ? (
    <Image
      alt="logo"
      src={pacsazLogoIcon}
      width={36 * scale}
      height={36}
      className={styles}
    />
  ) : (
    <Image
      alt="logo"
      src={pacsazLogoFull}
      width={85 * scale}
      height={36}
      className={styles}
    />
  );
};

export default PacsazLogo;
