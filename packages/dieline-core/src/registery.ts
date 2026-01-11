import homeDieline from "./dielines/boxes/home-dieline";
import tuckEnd from "./dielines/boxes/tuck-end";
import tuckEndSnapLock from "./dielines/boxes/tuck-end-snap-lock";
import postalCard from "./dielines/cards/postal-card";

export const dielines = {
  "postal-card": postalCard,
  "tuck-end": tuckEnd,
  "tuck-end-snap-lock": tuckEndSnapLock,
  "home-dieline": homeDieline,
};

export type DielineSlug = keyof typeof dielines;
