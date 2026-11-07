"use client";

import { BoardLights } from "./lights";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { applyArtwork, applyFold, buildRigScene, type RigScene } from "./build";
import { extractSegmentsFromSvg, extractWindows } from "./extract";
import { parseFoldConfig } from "./foldConfig";
import { buildFoldRig } from "./foldRig";
import type { FoldRig } from "./types";

/**
 * Read by the render loop, not by React: a scroll position changes every frame,
 * and a re-render per frame would rebuild nothing but still cost one. A motion
 * value from `motion` fits as it is.
 */
export type ProgressSource = {
  get(): number;
  on(event: "change", listener: (value: number) => void): () => void;
};

/** Where a design is painted: canvas pixels, with the two largest panels. */
export type PrintFrame = {
  width: number;
  height: number;
  panels: { x: number; y: number; width: number; height: number }[];
  /** Maps the dieline's own SVG coordinates onto the canvas. */
  scale: number;
  originX: number;
  originY: number;
};

export type PrintRun = {
  /** Paints the printed sheet. A new function repaints it. */
  paint: (context: CanvasRenderingContext2D, frame: PrintFrame) => void;
  /** Paints what shows where there is no ink. Plain board without it. */
  paintBare?: (context: CanvasRenderingContext2D, frame: PrintFrame) => void;
  /** 0 = bare board, 1 = fully printed. The ink sweeps across the sheet. */
  progress: ProgressSource;
};

export type FoldStageProps = {
  /** `toFoldSVG` output. */
  svg: string;
  material: string;
  thickness: number;
  foldConfig?: string | null;
  /** 0 = flat sheet seen square on, 1 = closed box seen from above a corner. */
  progress: ProgressSource;
  /**
   * Share of the view kept free on one side for text, -0.5 to 0.5. Positive moves
   * the model towards the left of the frame.
   */
  shift?: number | ProgressSource;
  /** The box drifts and follows the cursor, redrawing every frame while it does. */
  sway?: boolean;
  /** Stops drawing, for when the stage is off screen. */
  paused?: boolean;
  /** Pixels at the top of the view covered by something else, such as a navbar. */
  insetTop?: number;
  /** A design printed onto the flat sheet. */
  print?: PrintRun;
  className?: string;
  /** Clear film behind every window. */
  film?: boolean;
  /** Called once the model is on screen, so a caller can drop its placeholder. */
  onReady?: () => void;
};

const FOV = 24;
/** The closed box is seen from above one corner: polar angle from +Y, azimuth around it. */
const CLOSED_POLAR = THREE.MathUtils.degToRad(66);
const CLOSED_AZIMUTH = THREE.MathUtils.degToRad(38);
/** The camera turns over the first part of the fold, while the panels rise. */
const CAMERA_END = 0.62;
const PRINT_WIDTH = 1536;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The sheet as it comes off the press. The finished design is painted once, then
 * the canvas the model samples shows as much of it as the ink has reached, so a
 * step of the sweep costs one upload and no repainting.
 */
const createPress = (scene: RigScene, rig: FoldRig, paint: PrintRun["paint"], paintBare?: PrintRun["paintBare"]) => {
  const { width: flatWidth, height: flatHeight, min } = rig.bounds;
  const width = PRINT_WIDTH;
  const height = Math.max(2, Math.round((width * flatHeight) / flatWidth));
  const ratio = width / flatWidth;

  const panels = rig.nodes
    .map((node) => {
      const xs = node.face.outline.map((p) => p[0]);
      const ys = node.face.outline.map((p) => p[1]);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      return {
        area: Math.abs(node.face.area),
        x: (left - min[0]) * ratio,
        y: (top - min[1]) * ratio,
        width: (Math.max(...xs) - left) * ratio,
        height: (Math.max(...ys) - top) * ratio,
      };
    })
    .sort((a, b) => b.area - a.area)
    .slice(0, 2);

  const canvas = () => Object.assign(document.createElement("canvas"), { width, height });
  const art = canvas();
  const bare = canvas();
  const sheet = canvas();
  const artContext = art.getContext("2d");
  const bareContext = bare.getContext("2d");
  const sheetContext = sheet.getContext("2d");
  if (!artContext || !bareContext || !sheetContext) return null;

  const texture = new THREE.CanvasTexture(sheet);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  let shown = 0;
  const draw = (amount: number) => {
    sheetContext.drawImage(bare, 0, 0);
    // The press feeds from the right, the way the page reads.
    const edge = Math.round(width * (1 - amount));
    if (edge < width) sheetContext.drawImage(art, edge, 0, width - edge, height, edge, 0, width - edge, height);
    texture.needsUpdate = true;
    shown = amount;
  };

  const repaint = () => {
    const frame = { width, height, panels, scale: ratio, originX: min[0], originY: min[1] };
    artContext.clearRect(0, 0, width, height);
    paint(artContext, frame);
    bareContext.fillStyle = scene.style.color;
    bareContext.fillRect(0, 0, width, height);
    paintBare?.(bareContext, frame);
    draw(shown);
  };

  repaint();

  return {
    texture,
    repaint,
    set(amount: number) {
      const next = Math.min(1, Math.max(0, amount));
      if (next !== shown && (Math.abs(next - shown) > 0.004 || next === 0 || next === 1)) draw(next);
    },
  };
};

/** Everything the camera needs to frame the model flat and closed. */
const measure = (scene: RigScene, rig: FoldRig) => {
  const box = new THREE.Box3();
  const sphere = new THREE.Sphere();

  applyFold(scene, rig, 0);
  box.setFromObject(scene.group);
  const flatCenter = box.getCenter(new THREE.Vector3());
  const flatSize = box.getSize(new THREE.Vector3());

  applyFold(scene, rig, 1);
  box.setFromObject(scene.group);
  box.getBoundingSphere(sphere);

  return { flatCenter, flatSize, closedCenter: sphere.center.clone(), closedRadius: sphere.radius };
};

/** Drives the fold, the print and the camera from their sources, with no React in the loop. */
const Director = ({
  scene,
  rig,
  progress,
  shift: shiftBy,
  sway,
  insetTop,
  print,
  onReady,
}: {
  scene: RigScene;
  rig: FoldRig;
  progress: ProgressSource;
  shift: number | ProgressSource;
  sway: boolean;
  insetTop: number;
  print?: PrintRun;
  onReady?: () => void;
}) => {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const frame = useMemo(() => measure(scene, rig), [scene, rig]);
  const center = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const tilt = useMemo(() => ({ x: 0, y: 0 }), []);
  const pointer = useRef({ x: 0, y: 0 });
  // Where the visitor has turned the box by dragging, on top of the set view.
  const orbit = useMemo(() => ({ azimuth: 0, polar: 0 }), []);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const element = gl.domElement;
    element.style.cursor = "grab";
    // Vertical swipes still scroll the page on touch; sideways ones turn the box.
    element.style.touchAction = "pan-y";
    let last: { x: number; y: number } | null = null;
    const down = (event: PointerEvent) => {
      last = { x: event.clientX, y: event.clientY };
      element.style.cursor = "grabbing";
    };
    const move = (event: PointerEvent) => {
      if (!last) return;
      orbit.azimuth -= (event.clientX - last.x) * 0.008;
      orbit.polar = THREE.MathUtils.clamp(orbit.polar - (event.clientY - last.y) * 0.006, -0.9, 0.7);
      last = { x: event.clientX, y: event.clientY };
      invalidate();
    };
    const up = () => {
      last = null;
      element.style.cursor = "grab";
    };
    element.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      element.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, orbit, invalidate]);

  const ink = print?.progress;
  const paint = print?.paint;
  const paintBare = print?.paintBare;
  const press = useMemo(() => (paint ? createPress(scene, rig, paint, paintBare) : null), [scene, rig, paint, paintBare]);

  useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);
  useEffect(() => ink?.on("change", () => invalidate()), [ink, invalidate]);

  useEffect(() => {
    if (!press) return;
    applyArtwork(scene, press.texture);

    // The design's type may still be loading when it is first painted.
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (cancelled) return;
      press.repaint();
      invalidate();
    });

    return () => {
      cancelled = true;
      applyArtwork(scene, null);
      press.texture.dispose();
    };
  }, [press, scene, invalidate]);

  useEffect(() => {
    invalidate();
    onReady?.();
  }, [scene, invalidate, onReady]);

  useEffect(() => {
    if (!sway) return;
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [sway]);

  useFrame((state) => {
    const shift = typeof shiftBy === "number" ? shiftBy : shiftBy.get();
    const p = Math.min(1, Math.max(0, progress.get()));
    applyFold(scene, rig, p);
    if (ink) press?.set(ink.get());

    const t = smooth(Math.min(1, p / CAMERA_END));
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    // What is left of the frame for the model, and how much taller the frame is.
    const visible = Math.max(1, size.height - insetTop);
    const usable = (size.width * (1 - Math.abs(shift) * 2)) / visible;
    const tall = size.height / visible;

    const flatDistance = (Math.max(frame.flatSize.y / 2, frame.flatSize.x / 2 / usable) / tan) * tall;
    const closedDistance = (frame.closedRadius / tan) * tall * Math.max(1, 1 / usable);
    // The lids stand open until late, so the camera only closes in once they fall.
    const closing = smooth(Math.max(0, (p - 0.7) / 0.3));
    const distance = THREE.MathUtils.lerp(flatDistance * 1.16, closedDistance * 1.12, closing);

    // The closed box barely answers the cursor and drifts a little, so it feels
    // held; dragging is how the visitor really turns it.
    if (sway) {
      tilt.x += (pointer.current.x - tilt.x) * 0.06;
      tilt.y += (pointer.current.y - tilt.y) * 0.06;
    }
    const drift = sway ? Math.sin(state.clock.elapsedTime * 0.45) * 0.06 : 0;
    const azimuth = (CLOSED_AZIMUTH + drift + tilt.x * 0.08) * t + orbit.azimuth;
    const polar = THREE.MathUtils.clamp(THREE.MathUtils.lerp(Math.PI / 2, CLOSED_POLAR + tilt.y * 0.03, t) + orbit.polar, 0.15, Math.PI - 0.15);

    center.lerpVectors(frame.flatCenter, frame.closedCenter, t);
    offset.setFromSphericalCoords(distance, polar, azimuth);
    camera.position.copy(center).add(offset);
    camera.lookAt(center);

    camera.far = distance + frame.closedRadius * 40;
    camera.near = Math.max(1, distance * 0.05);
    camera.setViewOffset(size.width, size.height, shift * size.width, -insetTop / 2, size.width, size.height);
    camera.updateProjectionMatrix();
  });

  return <primitive object={scene.group} />;
};

/**
 * The fold as a piece of theatre: no controls and no backdrop, the camera and
 * the panels both follow `progress`. The product page's `DielineViewer` is the
 * tool; this one has one job, showing a sheet become a box.
 */
export const FoldStage = ({ svg, material, thickness, foldConfig, progress, shift = 0, sway = false, paused = false, insetTop = 0, print, film = false, className, onReady }: FoldStageProps) => {
  const rig = useMemo(() => {
    try {
      const segments = extractSegmentsFromSvg(svg);
      if (segments.length === 0) return null;
      const built = buildFoldRig(segments, parseFoldConfig(foldConfig), extractWindows(svg));
      if (built.nodes.length === 0) return null;
      // The sheet faces the camera printed side up, so it has to fold away from
      // it. The rig folds the other way, which would put the design on the inside
      // and show its mirror image on the outside.
      return { ...built, nodes: built.nodes.map((node) => ({ ...node, sign: (node.sign === 1 ? -1 : 1) as 1 | -1 })) };
    } catch (error) {
      console.error("[dieline-3d] fold rig failed", error);
      return null;
    }
  }, [svg, foldConfig]);

  const scene = useMemo(() => (rig ? buildRigScene({ rig, material, thickness, film: film ? extractWindows(svg) : undefined }) : null), [rig, material, thickness, film, svg]);

  useEffect(() => () => scene?.board?.dispose(), [scene]);

  if (!rig || !scene) return null;

  return (
    <Canvas className={className} flat frameloop={paused ? "never" : sway ? "always" : "demand"} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ fov: FOV, position: [0, 0, 1000] }}>
      <BoardLights distance={rig.bounds.width + rig.bounds.height} />

      <Director scene={scene} rig={rig} progress={progress} shift={shift} sway={sway} insetTop={insetTop} print={print} onReady={onReady} />
    </Canvas>
  );
};

export default FoldStage;
