import ProductNavbar from "@/components/Navbars/ProductNavbar";
import { dielines, DielineSlug } from "@repo/dieline-core/registery";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dieline = dielines[slug as DielineSlug];
  if (!dieline) return notFound();
  const productName = dieline.title;

  return (
    <div className="bg-accent flex flex-col h-screen overflow-hidden">
      <ProductNavbar productName={productName} />

      {children}
    </div>
  );
}
