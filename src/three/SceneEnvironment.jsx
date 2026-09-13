import { useLayoutEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js'
import envUrl from '../assets/textures/env/je_gray_02_1k.jpg'
import { LIGHTS } from './layout'

/**
 * The map is Poly Haven's je_gray_02, pre-baked for this scene by
 * scripts/bake-environment.mjs: resampled from 4k to 1k (PMREM builds a cube
 * of width / 4 px per face, so 1k gives the usual 256 and the 4k source only
 * bought a 1024-px cube nobody could see at the roughnesses we use) with the
 * sun disc clamped to a luminance of 2000 in the file's own units.
 *
 * Left alone, that disc (0.6° wide, 92 % of the sky's energy, 90 000 at peak)
 * lights a wall as hard as a 7-intensity directional light — from a direction
 * the shadow map knows nothing about, so it fills every cast shadow. At 2000
 * it still blurs into a hard white highlight on metal and glass, but its
 * diffuse contribution drops to ~0.2 per unit of environment intensity: a
 * touch of key leaking into the shade, which is all we want from it. The sun
 * itself is the directional light in <Lighting>.
 *
 * It ships as an UltraHDR JPEG (an 8-bit JPEG plus a gain map that restores
 * the range): 270 KB against 1.8 MB for the same map as RGBE and 28 MB for
 * the 4k source it used to download, decode and resample on every visit. The
 * energy in every band of the map is within 0.5 % of the RGBE bake.
 */

/**
 * Where the sun is in the map, in three's equirect convention
 * (u = atan2(z, x) / 2π + 0.5, v = asin(y) / π + 0.5). Measured by decoding the
 * source and taking the luminance-weighted centre of the sun disc: elevation
 * 21°, azimuth 36° from +x toward +z. The bake script prints where the
 * brightest pixel landed; re-measure if the source changes.
 */
const HDR_SUN = new THREE.Vector3(0.753, 0.363, 0.549)

/**
 * Yaw that turns the map so its sun sits on the key light's azimuth. Three
 * uploads the inverse of environmentRotation, so the map turns the way an
 * Object3D would: rotation.y = θ moves a feature at azimuth φ to φ − θ.
 * Elevation is left as it is (HDR 21°, key 35°); pitching the map would tilt
 * the horizon in every reflection, and the mismatch is invisible on the
 * cylinders and pipes where the highlight is actually seen.
 */
function sunToKeyYaw() {
  const sunAz = Math.atan2(HDR_SUN.z, HDR_SUN.x)
  const keyAz = Math.atan2(LIGHTS.key.z, LIGHTS.key.x)
  return sunAz - keyAz
}

/**
 * Feed the map into image-based lighting only. The page's white background
 * still shows through because the scene background remains unset. The map is
 * turned so its sun lines up with the key light; the sun disc is already
 * clamped in the file, so the directional light stays the only thing casting
 * the sun.
 *
 * A layout effect, not a passive one: a passive effect runs after the first
 * frame has painted, and that frame would compile every material without an
 * environment map only for all of them to be compiled again, with one, on
 * the next. With the map on the scene before the first render there is one
 * compile, and Precompile.jsx (which must run after this) can do it off the
 * main thread.
 */
export default function SceneEnvironment({ intensity = 1 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const hdr = useLoader(UltraHDRLoader, envUrl)

  useLayoutEffect(() => {
    hdr.mapping = THREE.EquirectangularReflectionMapping
    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromEquirectangular(hdr)
    pmrem.dispose()
    /* PMREM is what gets sampled; the equirect is never used again */
    hdr.dispose()

    const prevEnvironment = scene.environment
    const prevBackground = scene.background
    const prevIntensity = scene.environmentIntensity
    const prevRotation = scene.environmentRotation.clone()

    scene.environment = target.texture
    scene.background = null
    scene.environmentIntensity = intensity
    scene.environmentRotation.set(0, sunToKeyYaw(), 0)

    return () => {
      if (scene.environment === target.texture) scene.environment = prevEnvironment
      if (scene.background === null) scene.background = prevBackground
      scene.environmentIntensity = prevIntensity
      scene.environmentRotation.copy(prevRotation)
      target.dispose()
    }
  }, [gl, hdr, scene, intensity])

  return null
}
