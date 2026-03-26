import { prisma } from "./lib/prisma";

async function main() {
  const newAdmins = await prisma.admin.findMany({
    omit: { password: true },
  });
  console.log("All admins:", newAdmins);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
