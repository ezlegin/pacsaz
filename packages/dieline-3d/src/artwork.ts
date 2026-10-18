/**
 * Artwork placement on the flat dieline.
 *
 * The 3D panels sample UVs across the flat pattern's bounding box, so artwork is
 * positioned in the *same* normalized space as the placement editor: `cx`/`cy` are
 * the image centre in 0–1 pattern units and `scale` is its width as a fraction of
 * the pattern width. That shared definition is what makes dragging in the editor
 * land exactly where it appears on the model.
 *
 * The placed result is composed into a canvas rather than driven by texture
 * offset/repeat, because repeat would clamp and smear the image past its edges.
 */

export type ArtworkTransform = {
  /** Image width as a fraction of the pattern width; 1 spans it exactly. */
  scale: number;
  /** Image centre, 0–1 across the pattern. */
  cx: number;
  /** Image centre, 0–1 down the pattern. */
  cy: number;
};

export type ArtworkBounds = {
  width: number;
  height: number;
};

export const MIN_ARTWORK_SCALE = 0.15;
export const MAX_ARTWORK_SCALE = 4;

/** Centred and fitted to the pattern width. */
export const defaultArtworkTransform = (): ArtworkTransform => ({
  scale: 1,
  cx: 0.5,
  cy: 0.5,
});

export const clampArtworkScale = (scale: number): number =>
  Math.min(MAX_ARTWORK_SCALE, Math.max(MIN_ARTWORK_SCALE, scale));

export const clampArtworkCentre = (value: number): number =>
  Math.min(1.6, Math.max(-0.6, value));

/**
 * Draws the image onto a canvas covering the whole flat pattern.
 *
 * Painting the background first means any part of the pattern not covered by the
 * image reads as unprinted board instead of a stretched edge pixel.
 */
export const composeArtwork = ({
  image,
  transform,
  bounds,
  maxWidth = 2048,
}: {
  image: CanvasImageSource & { width: number; height: number };
  transform: ArtworkTransform;
  bounds: ArtworkBounds;
  maxWidth?: number;
}): HTMLCanvasElement | null => {
  const ratio = bounds.height / bounds.width;
  if (!Number.isFinite(ratio) || ratio <= 0) return null;

  const width = Math.max(2, Math.min(maxWidth, Math.round(maxWidth)));
  const height = Math.max(2, Math.round(width * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  // Uncovered pattern reads as plain board.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const scale = clampArtworkScale(transform.scale);
  const drawnWidth = scale * width;
  const drawnHeight =
    drawnWidth * (image.height / Math.max(1, image.width));

  const centreX = clampArtworkCentre(transform.cx) * width;
  const centreY = clampArtworkCentre(transform.cy) * height;

  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    centreX - drawnWidth / 2,
    centreY - drawnHeight / 2,
    drawnWidth,
    drawnHeight,
  );

  return canvas;
};
