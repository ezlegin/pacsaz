import { prisma } from "./lib/prisma";

async function main() {
  const admins = await prisma.admin.findMany({
    omit: { password: true },
  });
  console.log("All admins:", admins);
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
