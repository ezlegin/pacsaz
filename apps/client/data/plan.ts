// "use server";

// import { getSessionUser } from "@repo/auth/session";
// import { prisma } from "@repo/db";

// // todo: insert this fn into getSessionUser() from auth;
// export const getUserPlan = async () => {
//   const user = await getSessionUser();

//   if (!user) return null;

//   return await prisma.plan.findFirst({
//     where: { userId: user.id, endsAt: { gte: new Date() }, status: "active" },
//   });
// };
