import { pacsazLogo } from "@/public";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";

interface Props {
  productName: string;
}

const ProductNavbar = ({ productName }: Props) => {
  return (
    <div className="bg-background p-4 px-10 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image alt="logo" src={pacsazLogo} width={25} height={34} />
          <p className="text-muted-foreground">ساخت دایلاین</p>
          <ArrowLeft size={16} />
          <p className="font-semibold">{productName}</p>
          <Heart size={20} className="mr-2 text-muted-foreground" />
        </div>
        <div className="flex gap-3 items-center">
          <Button variant={"ghost"} className="gap-1">
            <Diamond />
            اشتراک
          </Button>
          <div>
            <div className="w-[1px] ml-3 h-6 bg-slate-300" />
          </div>
          <Button>حساب کاربری</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductNavbar;
