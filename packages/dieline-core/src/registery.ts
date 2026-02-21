import { Dieline } from "./core/dieline/Dieline";
import Dev from "./dielines/devs/dev";
import HomeDieline from "./dielines/home-dieline";
import PostalCard from "./dielines/postal-card";
import TuckEnd from "./dielines/tuck-end";
import TuckEndSnapLock from "./dielines/tuck-end-snap-lock";

export const dielines: Dieline[] = [
  Dev,
  PostalCard,
  TuckEnd,
  HomeDieline,
  TuckEndSnapLock,
];

export type DielineSlug = keyof typeof dielines;
