import Dev from "./dielines/devs/dev";
import PostalCard from "./dielines/PostalCard";

export const dielines = [Dev, PostalCard];

export type DielineSlug = keyof typeof dielines;
