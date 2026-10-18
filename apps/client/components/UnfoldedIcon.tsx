import { unfolded } from "@/public";
import Image from "next/image";

const UnfoldedIcon = ({ className }: { className?: string }) => {
  return (
    <Image src={unfolded} alt="" width={20} height={20} className={className} />
  );
};

export default UnfoldedIcon;
