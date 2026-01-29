import { pacsazLogoIcon } from "@/public";
import { Button } from "@repo/ui/components/button";
import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex justify-center items-center h-full pt-20">
      <div className="flex flex-col items-center gap-5">
        <Image alt="" src={pacsazLogoIcon} width={80} height={50} />
        <div>
          <h1 className="font-medium text-4xl text-center">
            Welcome to Pacsaz Docs
          </h1>
          <p className="max-w-md text-muted-foreground text-center">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Amet optio
            pariatur voluptatem error, commodi vel rem iusto voluptate quaerat
            incidunt.
          </p>
        </div>

        <div className="flex gap-5">
          <Link href={"/get-started"}>
            <Button size={"lg"} variant={"secondary"}>
              Get Started
            </Button>
          </Link>
          <Button
            size={"lg"}
            variant={"secondary"}
            className="text-muted-foreground cursor-auto"
          >
            <Copy />
            pnpm add pacsaz@latest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
