import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { layoutPaddings } from "./Navbar";
import NavbarButtons from "./NavbarButtons";
import PacsazLogo from "../PacsazLogo";
import FavoriteDieline from "../product/FavoriteDieline";

interface Props {
  productName: string;
}

const ProductNavbar = ({ productName }: Props) => {
  const isFaved = true;

  return (
    <div className={`bg-background border-b z-10 ${layoutPaddings}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={"/"}>
            <PacsazLogo />
          </Link>

          <Link href={"/dielines"} className="text-muted-foreground">
            ساخت دایلاین
          </Link>
          <ArrowLeft size={16} />
          <p className="font-semibold">{productName}</p>
          <FavoriteDieline isFaved={isFaved} />
        </div>
        <NavbarButtons />
      </div>
    </div>
  );
};

export default ProductNavbar;
