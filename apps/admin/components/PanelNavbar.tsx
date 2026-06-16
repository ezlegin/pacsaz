import { mainURL } from "@/data/envs";
import { Button } from "@repo/ui/components/button";
import { Home } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const PanelNavbar = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="border bg-accent rounded-md flex justify-center items-center px-3 text-sm">
            Online: <span className="font-medium ml-1">123</span>
          </div>

          <Link target="_blank" href={mainURL}>
            <Button variant={"outline"} size={"icon"}>
              <Home />
            </Button>
          </Link>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
};

export default PanelNavbar;
