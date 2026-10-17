"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { applyFold, buildRigScene, type RigScene } from "@/lib/dieline3d/build";
import { extractSegmentsFromSvg } from "@/lib/dieline3d/extract";
import { buildFoldRig } from "@/lib/dieline3d/foldRig";
import type { FoldRig } from "@/lib/dieline3d/types";

/**
 * Light neutral grey studio backdrop. Dark enough that a white board still reads
 * against it, neutral enough not to tint the kraft stock.
 */
const WORLD_BACKGROUND = "#e9ebee";

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
}: {
  scene: RigScene;
  rig: FoldRig;
  progress: number;
}) => {
  // Drive the fold. Also runs on mount so the initial pose is correct.
  useEffect(() => {
    applyFold(scene, rig, progress);
  }, [scene, rig, progress]);

  return <primitive object={scene.group} />;
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
  /** Extra controls rendered over the canvas (slider, buttons). */
  children?: React.ReactNode;
  className?: string;
  /** Rebuilding is skipped while the generator is still rendering. */
  isRendering?: boolean;
};

const DielineViewer = ({
  svg,
  material,
  thickness,
  progress,
  children,
  className,
  isRendering,
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

      const next = buildFoldRig(segments);
      if (next.nodes.length === 0) {
        return { rig: null, reason: "no-geometry" as const };
      }
      if (next.stats.hingeCount === 0) {
        return { rig: null, reason: "no-crease" as const };
      }

      return { rig: next, reason: null };
    } catch (error) {
      console.error("[DielineViewer] fold rig failed", error);
      return { rig: null, reason: "failed" as const };
    }
  }, [svg, isRendering]);

  const rig = build.rig;

  const scene = useMemo(() => {
    if (!rig) return null;

    try {
      return buildRigScene({ rig, material, thickness });
    } catch (error) {
      console.error("[DielineViewer] scene build failed", error);
      return null;
    }
  }, [rig, material, thickness]);

  /* ------------------------------ empty states ----------------------------- */
  if (!rig || !scene) {
    /**
     * Each reason gets its own message so a failure points at its real cause
     * instead of blaming the template for a missing crease when the geometry was
     * never read at all.
     */
    const message =
      build.reason === "pending"
        ? "در حال تولید دایلاین..."
        : build.reason === "no-crease"
          ? "این دایلاین خط تا ندارد، پس مدل سه‌بعدی تاشو برایش ممکن نیست."
          : build.reason === "no-geometry"
            ? "هندسه‌ی دایلاین خوانده نشد. صفحه را دوباره بارگذاری کن."
            : "ساخت مدل سه‌بعدی ناموفق بود.";

    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-4 py-10 text-center ${className ?? ""}`}
      >
        <p className="text-[11px] leading-6 text-muted-foreground">{message}</p>
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

        <RigObject scene={scene} rig={rig} progress={progress} />

        <OrbitControls
          makeDefault
          enablePan
          enableDamping
          dampingFactor={0.12}
          minDistance={span * 0.35}
          maxDistance={span * 4}
        />
      </Canvas>

      {children}
    </div>
  );
};

export default DielineViewer;
