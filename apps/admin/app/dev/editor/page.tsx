import { notFound } from "next/navigation";
import Playground from "./Playground";

/**
 * Development playground for the editor v2 canvas. Not part of the product:
 * it renders the reference tuck-end template without touching the database.
 */
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Playground />;
}

export const metadata = { title: "Editor v2 playground" };
