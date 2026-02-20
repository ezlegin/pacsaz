import Dev from "./dielines/devs/dev";
import HomeDieline from "./dielines/home-dieline";
import PostalCard from "./dielines/postal-card";
import TuckEnd from "./dielines/tuck-end";

export const dielines = [Dev, PostalCard, TuckEnd, HomeDieline];

export type DielineSlug = keyof typeof dielines;
