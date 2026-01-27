import { prisma } from "./lib/prisma";

async function fetchAdmins() {
  const admins = await prisma.admin.findMany({ omit: { password: true } });
  console.log("All Admins:", admins);
}

fetchAdmins()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("[Error Creating Admin:] ", e);
    await prisma.$disconnect();
    process.exit(1);
  });
