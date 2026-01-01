import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { navbarPaddings } from "../Navbars/Navbar";
import NavbarButtons from "../Navbars/NavbarButtons";
import PacsazLogo from "../PacsazLogo";

interface Props {
  productName: string;
}

const ProductNavbar = ({ productName }: Props) => {
  const isFaved = true;

  return (
    <div className={`bg-background border-b z-10 ${navbarPaddings}`}>
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
          <Button
            size={"icon"}
            variant={"ghost"}
            className="hover:text-destructive hover:border rounded-full"
          >
            <Bookmark
              size={18}
              className={cn(
                isFaved
                  ? "text-orange-400"
                  : "text-muted-foreground hover:text-destructive"
              )}
              fill={isFaved ? "#ff8904" : "transparent"}
            />
          </Button>
        </div>
        <NavbarButtons />
      </div>
    </div>
  );
};

export default ProductNavbar;
