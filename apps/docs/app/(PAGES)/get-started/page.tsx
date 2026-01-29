import { pages } from "@/components/SIdebar";
import { Button } from "@repo/ui/components/button";
import Flex from "@repo/ui/components/custom/Flex";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="space-y-5">
      <div className="max-w-md">
        <h1 className="font-semibold text-4xl">Docs:</h1>
        <p className="text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
          reiciendis nihil quidem voluptatibus eaque rerum cumque ipsum quia
          fuga repellat?
        </p>
      </div>

      <Flex>
        {pages.map((i, idx) => (
          <Link href={i.href} key={idx}>
            <Button size={"lg"} variant={"outline"}>
              {i.label}
            </Button>
          </Link>
        ))}
      </Flex>
    </div>
  );
};

export default page;
