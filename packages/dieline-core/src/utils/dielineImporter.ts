import { dielines, DielineSlug } from "../registery";

export function dielineImporter(slug: DielineSlug) {
  return dielines[slug as DielineSlug];
}
