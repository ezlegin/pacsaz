import ProductNavbar from "@/components/product/ProductNavbar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="bg-accent">
      <ProductNavbar productName={slug} />
      {children}
    </div>
  );
}
