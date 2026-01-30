import { Dieline } from "./data/types";
import dev from "./dielines/dev";

export const dielines: Dieline[] = [dev];

export type DielineSlug = keyof typeof dielines;
