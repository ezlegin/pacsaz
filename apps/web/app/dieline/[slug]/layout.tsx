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
    <div className="bg-accent grid grid-rows-[auto_1fr] h-screen">
      <ProductNavbar productName={slug} />
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}
