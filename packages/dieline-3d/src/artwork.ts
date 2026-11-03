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

/** Watermark tile size in pattern units: the same tile the 2D preview uses. */
export const watermarkTile = (bounds: ArtworkBounds): number =>
  Math.max(40, Math.min(bounds.width, bounds.height) / 2);

type Drawable = CanvasImageSource & { width: number; height: number };

/**
 * Draws the image onto a canvas covering the whole flat pattern, and tiles a
 * watermark over it when one is given (the model of a visitor without a paid
 * plan is marked like the flat preview).
 *
 * Painting the background first means any part of the pattern not covered by the
 * image reads as unprinted board instead of a stretched edge pixel.
 */
export const composeArtwork = ({
  image,
  watermark,
  transform,
  bounds,
  background = "#ffffff",
  maxWidth = 2048,
}: {
  image?: Drawable | null;
  watermark?: Drawable | null;
  transform: ArtworkTransform;
  bounds: ArtworkBounds;
  /** Colour of the unprinted board; the board's own colour when there is only a watermark. */
  background?: string;
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
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = "high";

  if (image) {
    const scale = clampArtworkScale(transform.scale);
    const drawnWidth = scale * width;
    const drawnHeight =
      drawnWidth * (image.height / Math.max(1, image.width));

    const centreX = clampArtworkCentre(transform.cx) * width;
    const centreY = clampArtworkCentre(transform.cy) * height;

    context.drawImage(
      image,
      centreX - drawnWidth / 2,
      centreY - drawnHeight / 2,
      drawnWidth,
      drawnHeight,
    );
  }

  if (watermark) {
    // Square tiles with the mark fitted inside, as the 2D preview's pattern does.
    const tile = (watermarkTile(bounds) * width) / bounds.width;
    const fit = Math.min(tile / Math.max(1, watermark.width), tile / Math.max(1, watermark.height));
    const w = watermark.width * fit;
    const h = watermark.height * fit;
    context.globalAlpha = 0.5;
    for (let y = 0; y < height; y += tile) {
      for (let x = 0; x < width; x += tile) {
        context.drawImage(watermark, x + (tile - w) / 2, y + (tile - h) / 2, w, h);
      }
    }
    context.globalAlpha = 1;
  }

  return canvas;
};
