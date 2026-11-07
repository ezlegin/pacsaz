import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

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
 * The lighting every board model uses, the product page's viewer and the home
 * page's stage alike: the key light follows the camera, the ambient light keeps
 * the faces turned away from it a soft grey. No environment map, because
 * reflections are what make card look like plastic. Pair with a `flat` canvas.
 */
export const BoardLights = ({ distance }: { distance: number }) => (
  <>
    <ambientLight intensity={1.4} />
    <KeyLight distance={distance} />
  </>
);
