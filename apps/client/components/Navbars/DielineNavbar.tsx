import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { layoutPaddings } from "./Navbar";
import NavbarButtons from "./NavbarButtons";
import PacsazLogo from "../PacsazLogo";
import FavoriteDieline from "../product/FavoriteDielineButton";
import { Dieline, prisma } from "@repo/db";

interface Props {
  dieline: Dieline;
}

const ProductNavbar = async ({ dieline }: Props) => {
  const favedDieline = await prisma.favedDieline.findFirst({
    where: { AND: [{ userId: 1 }, { dielineId: dieline.id }] },
  });

  return (
    <div className={`bg-background border-b z-10 ${layoutPaddings}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={"/"}>
            <PacsazLogo />
          </Link>

          <Link href={"/dielines"} className="text-muted-foreground">
            دایلاین‌ها
          </Link>
          <ArrowLeft size={16} />
          <p className="font-semibold">{dieline.title}</p>
          <FavoriteDieline isFaved={!!favedDieline} dielineId={dieline.id} />
        </div>
        <NavbarButtons />
      </div>
    </div>
  );
};

export default ProductNavbar;
