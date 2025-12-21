import { pacsazLogo } from "@/public";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";

interface Props {
  productName: string;
}

const ProductNavbar = ({ productName }: Props) => {
  const isFaved = true;

  return (
    <div className="bg-background p-4 px-10 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image alt="logo" src={pacsazLogo} width={25} height={34} />
          <p className="text-muted-foreground">ساخت دایلاین</p>
          <ArrowLeft size={16} />
          <p className="font-semibold">{productName}</p>
          <Button
            size={"icon"}
            variant={"ghost"}
            className="hover:text-destructive hover:border rounded-full"
          >
            <Heart
              size={18}
              className={cn(
                isFaved
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-destructive"
              )}
              fill={isFaved ? "#fb2c36" : "transparent"}
            />
          </Button>
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
