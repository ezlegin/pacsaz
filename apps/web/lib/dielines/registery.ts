import tuckEnd from "./categories/boxes/tuck-end";
import postalCard from "./categories/cards/postal-card";
import test from "./test";

export const dielines = {
  "postal-card": postalCard,
  "tuck-end": tuckEnd,
  test: test,
};

export type DielineSlug = keyof typeof dielines;
