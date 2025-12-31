import { pacsazLogoIcon, pacsazLogoFull } from "@/public";
import Image from "next/image";
import React from "react";

const PacsazLogo = ({ type = "icon" }: { type?: "icon" | "full" }) => {
  return type === "icon" ? (
    <Image alt="logo" src={pacsazLogoIcon} width={36} height={36} />
  ) : (
    <Image alt="logo" src={pacsazLogoFull} width={85} height={36} />
  );
};

export default PacsazLogo;
