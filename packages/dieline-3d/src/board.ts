import * as THREE from "three";

/**
 * Surface of corrugated board: a kraft liner with paper fibres, and the flutes
 * underneath showing through as soft ridges.
 *
 * The ridges are what tells one board from another: an F or E flute is a fine
 * ripple, a B or C flute a coarse one. Double walls show the outer flute, the
 * first letter of the name. Flutes run across the sheet's width, so the ridges
 * are vertical on the flat pattern, along a carton's height.
 */

/** Distance between flute crests, in mm (common industry pitches). */
const FLUTE_PITCH: Record<string, number> = { f: 2.4, e: 3.3, b: 6.5, c: 7.9, a: 9 };

export function flutePitch(material: string): number | null {
  const m = /^([a-z]+)Flute$/.exec(material);
  if (!m) return null;
  return FLUTE_PITCH[m[1]![0]!] ?? null;
}

export type BoardTextures = {
  map: THREE.Texture;
  bumpMap: THREE.Texture;
  /** Paints the liner over a canvas spanning the whole pattern, for artwork composed on top of it. */
  paint: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  dispose: () => void;
};

const SIZE = 512;

/**
 * Textures tiled across the flat pattern. UVs span the pattern's bounds (0–1),
 * so the repeat is the pattern size over the tile size, in mm.
 */
export function corrugatedTextures(material: string, bounds: { width: number; height: number }, color: string): BoardTextures | null {
  const pitch = flutePitch(material);
  if (pitch === null || typeof document === "undefined") return null;

  // A whole number of flutes per tile so the ridges meet across tile edges.
  const flutes = Math.max(4, Math.round(60 / pitch));
  const tile = flutes * pitch;

  // Deterministic noise, so the board does not change on every rebuild.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = SIZE;
  const c = colorCanvas.getContext("2d")!;
  c.fillStyle = color;
  c.fillRect(0, 0, SIZE, SIZE);
  // Fibres: short light and dark strokes, mostly along the machine direction.
  for (let i = 0; i < 2600; i++) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    const len = 3 + rand() * 10;
    const a = (rand() - 0.5) * 0.8;
    c.strokeStyle = rand() < 0.5 ? `rgba(90,60,25,${0.05 + rand() * 0.08})` : `rgba(255,240,215,${0.05 + rand() * 0.08})`;
    c.lineWidth = 0.6 + rand();
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    c.stroke();
  }
  // The flutes darken the liner very slightly between crests.
  for (let x = 0; x < SIZE; x++) {
    const s = Math.sin((x / SIZE) * flutes * Math.PI * 2);
    c.fillStyle = `rgba(70,45,15,${0.012 * (1 - s)})`;
    c.fillRect(x, 0, 1, SIZE);
  }

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = bumpCanvas.height = SIZE;
  const b = bumpCanvas.getContext("2d")!;
  for (let x = 0; x < SIZE; x++) {
    const s = Math.sin((x / SIZE) * flutes * Math.PI * 2);
    // Crests are rounder than the valleys, as a liner glued over flutes.
    const v = Math.round(128 + 110 * Math.sign(s) * Math.sqrt(Math.abs(s)));
    b.fillStyle = `rgb(${v},${v},${v})`;
    b.fillRect(x, 0, 1, SIZE);
  }

  const repeat = (t: THREE.Texture) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(bounds.width / tile, bounds.height / tile);
    t.anisotropy = 8;
    return t;
  };
  const map = repeat(new THREE.CanvasTexture(colorCanvas));
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = repeat(new THREE.CanvasTexture(bumpCanvas));
  return {
    map,
    bumpMap,
    paint: (context, width, height) => {
      const pattern = context.createPattern(colorCanvas, "repeat");
      if (!pattern) return;
      // One tile is `tile` mm of a pattern `bounds.width` mm across.
      const k = (tile / bounds.width) * (width / SIZE);
      pattern.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]));
      context.fillStyle = pattern;
      context.fillRect(0, 0, width, height);
    },
    dispose: () => {
      map.dispose();
      bumpMap.dispose();
    },
  };
}
