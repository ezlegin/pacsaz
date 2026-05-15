export const mainUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXTJS_PUBLIC_MAIN_URL;
