import { prisma } from "@repo/db";
import { emptyDocument, parseDocument, type DielineDocument } from "@repo/dieline-engine";
import { getCurrentAdmin } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import StudioEditor from "./StudioEditor";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Loads a stored editor v2 document. Specifications in the old format are not
 * converted (the project was never deployed); the editor starts empty and says
 * so, and the first save replaces them.
 */
function loadDocument(specification: string): { doc: DielineDocument; legacy: boolean } {
  try {
    const parsed = parseDocument(JSON.parse(specification));
    if (parsed.ok) return { doc: parsed.document, legacy: false };
  } catch {
    // Not JSON at all: treat like an old or empty specification.
  }
  return { doc: emptyDocument(), legacy: specification.trim() !== "" && specification.trim() !== "{}" };
}

const page = async ({ params }: Props) => {
  // The editor sits outside the (PANEL) layout, so it checks the admin itself.
  if (!(await getCurrentAdmin())) redirect("/login");

  const { slug } = await params;

  const dieline = await prisma.dieline.findFirst({
    where: { slug },
    include: {
      dielineImage: true,
      modelImage: true,
      settings: true,
      categoryByModel: true,
      categoryByUsage: true,
      _count: true,
    },
  });
  if (!dieline) notFound();

  const categories = {
    byModel: await prisma.dielineCategoryByModel.findMany(),
    byUsage: await prisma.dielineCategoryByUsage.findMany(),
  };

  const { doc, legacy } = loadDocument(dieline.specification);

  return <StudioEditor dieline={dieline} categories={categories} document={doc} legacy={legacy} />;
};

export default page;
