import ProductNavbar from "@/components/product/ProductNavbar";
import { dielines } from "@/lib/dielines";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dieline = dielines[slug as keyof typeof dielines];
  if (!dieline) return notFound();
  const productName = dieline.title + " - " + dieline.code;

  return (
    <div className="bg-accent grid grid-rows-[auto_1fr] h-screen">
      <ProductNavbar productName={productName} />
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}
