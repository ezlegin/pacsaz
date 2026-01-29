import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import Flex from "@repo/ui/components/custom/Flex";
import Link from "next/link";
import React from "react";

export const pages = [
  { label: "Shapes", href: "/get-started/shapes" },
  { label: "Models", href: "/get-started/models" },
];

const Sidebar = () => {
  const pgs = [
    {
      label: "Gat Started",
      href: "/get-started",
    },

    {
      group: [
        {
          label: "Shapes",
          href: "/get-started/shpaes",
        },
      ],
    },
  ];

  return (
    <Card>
      <Flex className="flex-col items-start gap-2">
        {pgs.map((p, idx) => (
          <div key={idx}>
            {p.group ? (
              p.group?.map((g, idx) => (
                <Button
                  size={"lg"}
                  variant={"link"}
                  key={idx}
                  className="p-0 text-muted-foreground hover:text-primary-foreground hover:no-underline h-fit text-base pl-3"
                >
                  • <Link href={g.href}>{g.label}</Link>
                </Button>
              ))
            ) : (
              <Button
                size={"lg"}
                variant={"link"}
                key={idx}
                className="p-0 text-muted-foreground hover:text-primary-foreground hover:no-underline h-fit text-base"
              >
                <Link href={p.href}>{p.label}</Link>
              </Button>
            )}
          </div>
        ))}
      </Flex>
    </Card>
  );
};

export default Sidebar;
