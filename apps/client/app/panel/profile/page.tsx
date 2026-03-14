import Card from "@repo/ui/components/custom/Card";
import { ProfileForm } from "@/components/forms/ProfileForm";
import React from "react";
import { prisma } from "@repo/db";
import { notFound } from "next/navigation";

const page = async () => {
  const user = await prisma.user.findFirst(); //todo

  if (!user) notFound(); // todo

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <ProfileForm user={user} />
      </Card>
    </div>
  );
};

export default page;
