import { dielines } from "@repo/dieline-core/registery";

export function dielineImporter(slug: string) {
  return dielines.find((d) => d.slug === slug);
}
