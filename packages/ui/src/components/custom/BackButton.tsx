"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant={"secondary"}>
      <ChevronLeft />
      Back
    </Button>
  );
};

export default BackButton;
