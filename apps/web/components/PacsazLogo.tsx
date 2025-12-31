import { pacsazLogo, pacsazLogoFull } from "@/public";
import Image from "next/image";
import React from "react";

const PacsazLogo = ({ type = "icon" }: { type?: "icon" | "full" }) => {
  return type === "icon" ? (
    <Image alt="logo" src={pacsazLogo} width={25} height={34} />
  ) : (
    <Image alt="logo" src={pacsazLogoFull} width={70} height={34} />
  );
};

export default PacsazLogo;
