import dev from "./dielines/devs/Dev";

export const dielines = [dev];

export type DielineSlug = keyof typeof dielines;
