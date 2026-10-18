"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type * as THREE from "three";
import { applyFold, buildRigScene, type RigScene } from "./build";
import { extractSegmentsFromSvg } from "./extract";
import { buildFoldRig } from "./foldRig";
import { parseFoldConfig } from "./foldConfig";
import type { FoldRig } from "./types";

/**
 * Light neutral grey studio backdrop. Dark enough that a white board still reads
 * against it, neutral enough not to tint the kraft stock.
 */
const WORLD_BACKGROUND = "#e9ebee";

/** Highlight colour for the panel selected in an editor. */
const SELECTION_COLOR = "#7c3aed";

/** Why the viewer has nothing to draw. */
export type ViewerEmptyReason = "pending" | "no-geometry" | "failed";

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
  className?: string;
  /**
   * Overlay content, e.g. a fold slider. May be a function to receive facts about
   * the model — a dieline with no creases renders flat, and a caller usually wants
   * to hide fold controls in that case.
   */
  children?:
    | React.ReactNode
    | ((info: { hasHinges: boolean; hingeCount: number }) => React.ReactNode);
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
  className,
  children,
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
      const next = buildFoldRig(segments, config);
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
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{
          position: [cameraDistance * 0.55, -cameraDistance * 0.9, cameraDistance],
          fov: 42,
          near: 1,
          far: span * 20,
        }}
      >
        {/* Neutral studio backdrop rather than the page showing through. */}
        <color attach="background" args={[WORLD_BACKGROUND]} />

        {/*
          Three lights, no shadow maps — cheap and enough to read the form.
          The hemisphere gives a soft sky/ground gradient instead of a flat
          ambient wash, which is what makes folded panels legible.
        */}
        <hemisphereLight args={["#ffffff", "#c6cad0", 0.85]} />

        {/* Key light, upper front-left. */}
        <directionalLight
          position={[span * 0.8, -span, span * 1.4]}
          intensity={1.6}
        />

        {/* Gentle fill from the opposite side so shaded panels still read. */}
        <directionalLight
          position={[-span * 0.9, span * 0.6, span * 0.5]}
          intensity={0.35}
        />

        <RigObject
          scene={scene}
          rig={rig}
          progress={progress}
          onPanelClick={onPanelClick}
        />

        <OrbitControls
          makeDefault
          enablePan
          enableDamping
          dampingFactor={0.12}
          minDistance={span * 0.35}
          maxDistance={span * 4}
        />
      </Canvas>

      {typeof children === "function"
        ? children({
            hasHinges: rig.stats.hingeCount > 0,
            hingeCount: rig.stats.hingeCount,
          })
        : children}
    </div>
  );
};

export default DielineViewer;
