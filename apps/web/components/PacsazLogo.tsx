import { pacsazLogoIcon, pacsazLogoFull } from "@/public";
import Image from "next/image";
import React from "react";

const PacsazLogo = ({
  type = "icon",
  scale = 1,
}: {
  type?: "icon" | "full";
  scale?: number;
}) => {
  return type === "icon" ? (
    <Image
      alt="logo"
      src={pacsazLogoIcon}
      width={36 * scale}
      height={36}
      className="select-none"
    />
  ) : (
    <Image
      alt="logo"
      src={pacsazLogoFull}
      width={85 * scale}
      height={36}
      className="select-none"
    />
  );
};

export default PacsazLogo;
