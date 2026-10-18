export const INDENT = 8;

/**
 * The radius effects the layer dialog can author. Each one is a different way of
 * choosing a radius per corner, but they all end up in the same engine helper.
 */
export type RadiusKind = "radius" | "radiusAt" | "customRadiusAt" | "fullRadius";

/** A single corner's radius, as edited in the `customRadiusAt` field array. */
export type CornerRadius = { index: string; radius: string };
