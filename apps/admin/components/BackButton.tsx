// Lives in the app rather than @repo/ui: it imports next/navigation, and Next.js
// imports inside the shared UI package make Vercel treat packages/ui as a
// deployable service.
"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
