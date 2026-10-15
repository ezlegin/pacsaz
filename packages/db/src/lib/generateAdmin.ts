// prisma/generateAdmin.ts
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

const adminEmail = process.env.ADMIN_EMAIL;
const adminFullName = process.env.ADMIN_FULLNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminPhoneNumber = process.env.ADMIN_PHONENUMBER;

async function main() {
  if (!adminEmail || !adminPassword || !adminFullName || !adminPhoneNumber) {
    console.error(
      "❌ Admin envs are required in .env file. [/prisma/generateAdmin.ts]",
    );
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("✅ Admin already exists, skipping.");
    return;
  }

  const hashedPass = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.create({
    data: {
      email: adminEmail,
      fullName: adminFullName,
      phoneNumber: adminPhoneNumber,
      password: hashedPass,
    },
  });

  console.log("✅ Admin created successfully.");
}

main()
  .catch((err) => {
    console.error(
      "[/prisma/generateAdmin.ts] ❌ Failed to generate admin:",
      err,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
