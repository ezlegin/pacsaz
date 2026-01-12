import ProductNavbar from "@/components/Navbars/ProductNavbar";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dieline = dielineImporter(slug);
  if (!dieline) return notFound();

  return (
    <div className="bg-accent flex flex-col h-screen overflow-hidden">
      <ProductNavbar productName={dieline.title} />

      {children}
    </div>
  );
}
