import homeDieline from "./categories/boxes/home-dieline";
import tuckEnd from "./categories/boxes/tuck-end";
import postalCard from "./categories/cards/postal-card";

export const dielines = {
  "postal-card": postalCard,
  "tuck-end": tuckEnd,
  "home-dieline": homeDieline,
};

export type DielineSlug = keyof typeof dielines;
