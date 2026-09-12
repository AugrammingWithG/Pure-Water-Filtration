import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import hdrUrl from '../assets/textures/wood/je_gray_02_4k.hdr?url'
import { LIGHTS } from './layout'

/**
 * Where the sun is in the HDR, in three's equirect convention
 * (u = atan2(z, x) / 2π + 0.5, v = asin(y) / π + 0.5). Measured by decoding the
 * file and taking the luminance-weighted centre of the sun disc: a 0.6° spot
 * that carries 92 % of the sky's energy. Elevation 21°, azimuth 36° from +x
 * toward +z. Re-measure if the file changes.
 */
const HDR_SUN = new THREE.Vector3(0.753, 0.363, 0.549)

/**
 * Radiance cap applied to the map before it is turned into lighting, in the
 * file's own units (the sky averages 0.1, the sun disc 90 000). Left alone,
 * that disc lights a wall as hard as a 7-intensity directional light — from a
 * direction the shadow map knows nothing about, so it fills every cast shadow.
 * At 2000 the disc still blurs into a hard white highlight on metal and glass,
 * but its diffuse contribution drops to ~0.2 per unit of environment
 * intensity: a touch of key leaking into the shade, which is all we want from
 * it. The sun itself is the directional light in <Lighting>.
 */
const SUN_CLAMP = 2000

/**
 * The map is resampled to this size on the way in. PMREM builds a cube of
 * (width / 4) px per face, so 1k gives the usual 256 — a 4k source would
 * otherwise cost a 1024-px cube for no visible gain at the roughnesses we use.
 */
const PREPASS_SIZE = [1024, 512]

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

const PREPASS_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const PREPASS_FRAG = /* glsl */ `
  uniform sampler2D map;
  uniform float maxLum;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(map, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    if (l > maxLum) c *= maxLum / l;
    gl_FragColor = vec4(c, 1.0);
  }
`

/**
 * Copy the HDR into a smaller equirect with the sun clamped. Runs once, on the
 * GPU. The result is what PMREM sees; the source texture is released from the
 * GPU afterwards (a 4k half-float upload is ~64 MB we never sample again).
 */
function conditionEquirect(gl, hdr) {
  const rt = new THREE.WebGLRenderTarget(PREPASS_SIZE[0], PREPASS_SIZE[1], {
    type: THREE.HalfFloatType,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  rt.texture.mapping = THREE.EquirectangularReflectionMapping
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace

  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: hdr }, maxLum: { value: SUN_CLAMP } },
    vertexShader: PREPASS_VERT,
    fragmentShader: PREPASS_FRAG,
    depthTest: false,
    depthWrite: false,
  })
  /* one triangle that covers the whole target */
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  const scene = new THREE.Scene().add(mesh)
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const prevTarget = gl.getRenderTarget()
  gl.setRenderTarget(rt)
  gl.render(scene, camera)
  gl.setRenderTarget(prevTarget)

  material.dispose()
  geometry.dispose()
  hdr.dispose()
  return rt
}

/**
 * Feed the HDR into image-based lighting only. The page's white background
 * still shows through because the scene background remains unset. The map is
 * turned so its sun lines up with the key light, and the sun disc is clamped
 * so the directional light stays the only thing casting the sun.
 */
export default function SceneEnvironment({ intensity = 1 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const hdr = useLoader(HDRLoader, hdrUrl)

  useEffect(() => {
    const equirect = conditionEquirect(gl, hdr)
    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromEquirectangular(equirect.texture)
    pmrem.dispose()
    equirect.dispose()

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
