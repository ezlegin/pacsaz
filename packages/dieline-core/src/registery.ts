import tuckEndSnapLock from "./dielines/tuck-end-snap-lock";
import postalCard from "./dielines/postal-card";
import { DielineGeneratorProps } from "./data/types";
import homeDieline from "./dielines/home-dieline";
import tuckEnd from "./dielines/tuck-end";

export const dielines: DielineGeneratorProps[] = [
  postalCard,
  tuckEnd,
  tuckEndSnapLock,
  homeDieline,
];

export type DielineSlug = keyof typeof dielines;
