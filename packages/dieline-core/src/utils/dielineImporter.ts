import { dielines } from "../registery";

export function dielineImporter(slug: string) {
  return dielines.find((d) => d.slug === slug);
}
