import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Fades every mesh beneath it toward `opacity` (0..1) over time. Used for the
 * house cutaway (roof + front wall lift away for the under-sink view) and the
 * x-ray covers on the sealed units.
 *
 * Meshes fully faded out are hidden so they stop casting shadows and
 * swallowing clicks. Materials must not be shared with meshes outside the
 * group — each JSX <meshStandardMaterial> is its own instance, so that holds
 * as long as nothing passes a material object in by reference.
 */
export default function FadeGroup({ opacity = 1, speed = 5, children, ...props }) {
  const group = useRef()
  const current = useRef(opacity)
  const meshes = useRef([])

  // Collect meshes once mounted; remember each one's shadow flag so it can be
  // restored on the way back in.
  useEffect(() => {
    const list = []
    group.current?.traverse((obj) => {
      if (obj.isMesh && obj.material && !obj.userData.noFade) {
        obj.userData.castShadowDefault = obj.castShadow
        obj.userData.opacityDefault = obj.material.opacity ?? 1
        list.push(obj)
      }
    })
    meshes.current = list
    apply(list, current.current)
  }, [])

  useFrame((_, delta) => {
    const c = current.current
    if (Math.abs(c - opacity) < 0.002) {
      if (c !== opacity) {
        current.current = opacity
        apply(meshes.current, opacity)
      }
      return
    }
    current.current = c + (opacity - c) * Math.min(1, delta * speed)
    apply(meshes.current, current.current)
  })

  return (
    <group ref={group} {...props}>
      {children}
    </group>
  )
}

function apply(list, o) {
  for (const mesh of list) {
    const mat = mesh.material
    const base = mesh.userData.opacityDefault
    const value = base * o
    mat.opacity = value
    // `transparent` is baked into the compiled shader (the OPAQUE define
    // forces alpha to 1), so flipping it needs a recompile to take effect.
    const transparent = value < 0.999
    if (mat.transparent !== transparent) {
      mat.transparent = transparent
      mat.needsUpdate = true
    }
    mat.depthWrite = value > 0.5
    mesh.visible = value > 0.01
    mesh.castShadow = mesh.userData.castShadowDefault && value > 0.5
  }
}
