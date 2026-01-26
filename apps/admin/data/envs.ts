import { onDevelepe } from "@repo/lib/data/consts";

export const mainURL = onDevelepe
  ? "http://localhost:3000/"
  : (process.env.NEXTJS_PUBLIC_MAIN_URL ?? "https://pacsaz.ir");
