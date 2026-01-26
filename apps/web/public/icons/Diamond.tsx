import Image from "next/image";
import React from "react";
import { diamond } from "..";

const Diamond = ({ size }: { size?: number }) => {
  return (
    <Image
      alt=""
      src={diamond}
      width={size ?? 16}
      height={size ?? 16}
      className="pointer-events-none select-none"
    />
  );
};

export default Diamond;
