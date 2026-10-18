import { folded } from "@/public";
import Image from "next/image";
import React from "react";

const FoldedIcon = ({ className }: { className?: string }) => {
  return (
    <Image src={folded} alt="" width={20} height={20} className={className} />
  );
};

export default FoldedIcon;
