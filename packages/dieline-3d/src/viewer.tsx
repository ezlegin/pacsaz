"use client";

import { Bounds, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { applyArtwork, applyFold, buildRigScene, materialStyleFor, type RigScene } from "./build";
import { composeArtwork, type ArtworkTransform } from "./artwork";
import { extractSegmentsFromSvg, extractWindows } from "./extract";
import { buildFoldRig } from "./foldRig";
import { parseFoldConfig } from "./foldConfig";
import type { FoldRig } from "./types";

/**
 * The world: a grey gradient, darker at the top, drawn by CSS behind a transparent
 * canvas. Dark enough that a white board stands out, neutral so kraft stays kraft.
 */
const BACKDROP = "linear-gradient(to bottom, #b2b2b2 0%, #c9c9c9 45%, #e8e8e8 100%)";

/** Highlight colour for the panel selected in an editor. */
const SELECTION_COLOR = "#7c3aed";

/** Why the viewer has nothing to draw. */
export type ViewerEmptyReason = "pending" | "no-geometry" | "failed";

/** The key light's direction in view space: up and to the viewer's left. */
const KEY_DIRECTION = new THREE.Vector3(-0.9, 0.5, 0.6).normalize();

/**
 * A light that moves with the camera, so whichever way the model is turned, the
 * face on the left is bright and the one on the right soft grey. A light fixed in
 * the world leaves the back of the box dark.
 */
const KeyLight = ({ distance }: { distance: number }) => {
  const light = useRef<THREE.DirectionalLight>(null);
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    light.current?.position
      .copy(KEY_DIRECTION)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(distance);
  });

  return <directionalLight ref={light} intensity={2} />;
};

/**
 * Imperative bridge between the fold rig and React Three Fiber.
 *
 * The rig is built as a plain three.js object graph (that is where the hinge
 * hierarchy lives), then attached with `<primitive>`. R3F drives the render loop
 * and camera; this component only writes rotation.
 */
const RigObject = ({
  scene,
  rig,
  progress,
  onPanelClick,
}: {
  scene: RigScene;
  rig: FoldRig;
  progress: number;
  onPanelClick?: (panelIndex: number) => void;
}) => {
  // Drive the fold. Also runs on mount so the initial pose is correct.
  useEffect(() => {
    applyFold(scene, rig, progress);
  }, [scene, rig, progress]);

  return (
    <primitive
      object={scene.group}
      onClick={
        onPanelClick
          ? (event: { stopPropagation: () => void; object: THREE.Object3D }) => {
              event.stopPropagation();

              const index = event.object.userData?.panelIndex;
              if (typeof index === "number") onPanelClick(index);
            }
          : undefined
      }
    />
  );
};

export type DielineViewerProps = {
  /** The generated dieline SVG (already exported by the generator). */
  svg: string;
  /** Material key, e.g. `glossyCardboard` or `bFlute`. */
  material: string;
  /** Board thickness in mm — the selected material's, or a custom value. */
  thickness: number;
  /** 0 = flat sheet, 1 = fully closed. */
  progress: number;
  /** Rebuilding is skipped while the generator is still rendering. */
  isRendering?: boolean;
  /**
   * Authored fold overrides as stored JSON. Absent or unparseable means every
   * crease uses the inferred direction.
   */
  foldConfig?: string | null;
  /**
   * Artwork to print across the flat pattern, with its placement. Purely visual:
   * the viewer never uploads it, so it lives only as long as the caller's URL.
   */
  artwork?: { url: string; transform: ArtworkTransform } | null;
  /**
   * Image tiled over the whole model, as the flat preview is for visitors
   * without a paid plan.
   */
  watermark?: string | null;
  className?: string;
  /**
   * Overlay content drawn on top of the canvas. Rarely needed: chrome that should
   * sit *below* the model belongs outside the viewer, so it stays flush.
   */
  children?: React.ReactNode;
  /**
   * Reports what the model turned out to be, so a caller can adapt its chrome —
   * e.g. hide a fold slider for a dieline with no creases.
   */
  onModelInfo?: (info: { hasHinges: boolean; hingeCount: number }) => void;
  /** Called with the panel index when a panel is clicked. */
  onPanelClick?: (panelIndex: number) => void;
  /** Panel index to highlight, for editor selection. */
  selectedPanel?: number | null;
  /**
   * Rendered when there is nothing to draw. Injected because the client is
   * Persian and the admin panel is English.
   */
  renderEmpty?: (reason: ViewerEmptyReason) => React.ReactNode;
};

export const DielineViewer = ({
  svg,
  material,
  thickness,
  progress,
  isRendering,
  foldConfig,
  artwork,
  watermark,
  className,
  children,
  onModelInfo,
  onPanelClick,
  selectedPanel,
  renderEmpty,
}: DielineViewerProps) => {
  /**
   * The rig is derived data, so it is memoised on its actual inputs. Any change
   * to the generated SVG (which is what a specification change produces) rebuilds
   * it; an unrelated re-render does not.
   */
  const build = useMemo(() => {
    if (!svg || isRendering) return { rig: null, reason: "pending" as const };

    try {
      const segments = extractSegmentsFromSvg(svg);
      if (segments.length === 0) {
        return { rig: null, reason: "no-geometry" as const };
      }

      const config = parseFoldConfig(foldConfig);
      const next = buildFoldRig(segments, config, extractWindows(svg));
      if (next.nodes.length === 0) {
        return { rig: null, reason: "no-geometry" as const };
      }

      /*
       * A dieline with no creases still has geometry worth showing — a business
       * card, a hang card with a hole, a single glued panel. Those render as a
       * static flat model, so a missing crease is not an error.
       */
      return { rig: next, reason: null };
    } catch (error) {
      console.error("[dieline-3d] fold rig failed", error);
      return { rig: null, reason: "failed" as const };
    }
  }, [svg, isRendering, foldConfig]);

  const rig = build.rig;

  const scene = useMemo(() => {
    if (!rig) return null;

    try {
      return buildRigScene({ rig, material, thickness });
    } catch (error) {
      console.error("[dieline-3d] scene build failed", error);
      return null;
    }
  }, [rig, material, thickness]);

  /** Outline the selected panel so an editor can show what is being edited. */
  useEffect(() => {
    if (!scene) return;

    scene.group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      const material3d = mesh.material as THREE.MeshStandardMaterial;
      if (!material3d?.emissive) return;

      const isSelected = mesh.userData.panelIndex === selectedPanel;
      material3d.emissive.set(isSelected ? SELECTION_COLOR : "#000000");
      material3d.emissiveIntensity = isSelected ? 0.4 : 0;
      material3d.needsUpdate = true;
    });
  }, [scene, selectedPanel]);

  /**
   * Artwork is composed into a texture in two stages, on purpose.
   *
   * Decoding is keyed on the URL only: dragging fires a transform change on every
   * pointer move, and re-decoding the image each time would be wasteful and would
   * make the model stutter. Composition is keyed on the transform, so dragging
   * only redraws the canvas.
   *
   * The result is drawn onto a canvas spanning the whole flat pattern rather than
   * panning the texture with offset/repeat, because repeat would clamp and smear
   * the image's edge pixels across the uncovered part of the sheet.
   *
   * Composition deps are the transform's primitives, not the object, so an inline
   * object from the caller cannot trigger needless work.
   */
  const [artworkTexture, setArtworkTexture] = useState<THREE.Texture | null>(
    null,
  );

  const artworkUrl = artwork?.url;
  const artworkScale = artwork?.transform.scale;
  const artworkCx = artwork?.transform.cx;
  const artworkCy = artwork?.transform.cy;
  const bounds = rig?.bounds;

  /* --------------------------- decode once per URL ------------------------- */
  const artworkImage = useDecodedImage(artworkUrl, "artwork");
  const watermarkImage = useDecodedImage(watermark ?? undefined, "watermark");
  const boardColor = materialStyleFor(material).color;
  const board = scene?.board ?? null;

  /* ---------------------- recompose on every placement --------------------- */
  useEffect(() => {
    if ((!artworkImage && !watermarkImage) || !bounds) {
      setArtworkTexture(null);
      return;
    }

    try {
      const canvas = composeArtwork({
        image: artworkImage,
        watermark: watermarkImage,
        transform: {
          scale: artworkScale ?? 1,
          cx: artworkCx ?? 0.5,
          cy: artworkCy ?? 0.5,
        },
        bounds,
        // A watermark alone keeps the board's look; artwork is printed on white.
        background: artworkImage ? "#ffffff" : (board?.paint ?? boardColor),
        // Live preview: dragging recomposes on every move, so a 2048px canvas
        // would be wasted work for a model this size on screen.
        maxWidth: 1024,
      });

      if (!canvas) {
        setArtworkTexture(null);
        return;
      }

      const texture = new THREE.CanvasTexture(canvas);
      // Artwork is colour, not data, so it must decode as sRGB.
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;

      setArtworkTexture(texture);
    } catch (error) {
      console.error("[dieline-3d] artwork compose failed", error);
      setArtworkTexture(null);
    }
  }, [artworkImage, watermarkImage, boardColor, board, artworkScale, artworkCx, artworkCy, bounds]);

  useEffect(() => {
    if (!scene) return;

    applyArtwork(scene, artworkTexture);
    return () => applyArtwork(scene, null);
  }, [scene, artworkTexture]);

  useEffect(() => () => scene?.board?.dispose(), [scene]);

  // Release the GPU texture once it is no longer referenced.
  useEffect(() => () => artworkTexture?.dispose(), [artworkTexture]);

  /**
   * Report the model's shape. A dieline with no creases still renders, but a fold
   * control would do nothing, so callers need to know.
   */
  useEffect(() => {
    if (!onModelInfo) return;

    onModelInfo({
      hasHinges: (rig?.stats.hingeCount ?? 0) > 0,
      hingeCount: rig?.stats.hingeCount ?? 0,
    });
  }, [rig, onModelInfo]);

  /* ------------------------------ empty states ----------------------------- */
  if (!rig || !scene) {
    // `build` is a discriminated union, but narrowing `rig` does not narrow it.
    const reason: ViewerEmptyReason = build.reason ?? "failed";

    if (renderEmpty) return <>{renderEmpty(reason)}</>;

    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-100 px-4 py-10 text-center text-xs text-neutral-500 ${className ?? ""}`}
      >
        —
      </div>
    );
  }

  /** Camera distance from the model's own size, so any template fits. */
  const span = Math.max(
    rig.bounds.width,
    rig.bounds.height,
    scene.size.z,
    10,
  );
  const cameraDistance = span * 1.15;

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ background: BACKDROP }}>
      <Canvas
        dpr={[1, 2]}
        // No tone mapping, so a white board under full light stays white.
        flat
        gl={{ antialias: true, alpha: true }}
        camera={{
          /* Start above and to the right, looking down at the model. */
          position: [
            cameraDistance * 0.72,
            cameraDistance * 0.5,
            cameraDistance * 0.95,
          ],
          fov: 42,
          near: 1,
          far: span * 20,
        }}
      >
        {/*
          The key light follows the camera; the ambient light keeps the faces
          turned away from it a soft grey. No environment map, because reflections
          are what make card look like plastic.
        */}
        <ambientLight intensity={1.4} />
        <KeyLight distance={span} />

        {/* Fit the model to the viewer on first view and whenever it is rebuilt or resized. */}
        <Bounds fit clip observe margin={1.75} maxDuration={0}>
          <RigObject
            scene={scene}
            rig={rig}
            progress={progress}
            onPanelClick={onPanelClick}
          />
        </Bounds>

        <OrbitControls
          makeDefault
          enablePan
          enableDamping
          dampingFactor={0.12}
          minDistance={span * 0.45}
          maxDistance={span * 4}
        />
      </Canvas>

      {children}
    </div>
  );
};

export default DielineViewer;

/** Decodes an image once per URL; null until it loads or when it fails. */
function useDecodedImage(url: string | undefined, what: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    let cancelled = false;
    const next = new Image();

    next.onload = () => {
      if (!cancelled) setImage(next);
    };

    next.onerror = () => {
      if (cancelled) return;
      console.error(`[dieline-3d] ${what} failed to decode`);
      setImage(null);
    };

    next.src = url;

    return () => {
      cancelled = true;
    };
  }, [url, what]);

  return image;
}
