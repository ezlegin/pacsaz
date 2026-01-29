import { Card } from "@repo/ui/components/card";
import PacsazLogo from "@repo/ui/components/custom/PacsazLogo";
import React from "react";
import Flex from "@repo/ui/components/custom/Flex";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

const Navbar = () => {
  return (
    <Card className="px-5">
      <Flex className="justify-between">
        <div className="flex">
          <Flex>
            <PacsazLogo />
            <span className="text-lg font-medium">Pacsaz</span>
          </Flex>
        </div>

        <Button variant={"outline"}>
          <Link href={"./get-started"}>Get Started</Link>
        </Button>
      </Flex>
    </Card>
  );
};

export default Navbar;
