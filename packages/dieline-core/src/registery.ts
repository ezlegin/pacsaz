import { Dieline } from "./core/dieline/Dieline";
import Dev from "./dielines/devs/dev";
import PostalCard from "./dielines/postal-card";
import TuckEnd from "./dielines/tuck-end";
import TuckEndSnapLock from "./dielines/tuck-end-snap-lock";

export const dielines: Dieline[] = [Dev, PostalCard, TuckEnd, TuckEndSnapLock];

export type DielineSlug = keyof typeof dielines;
