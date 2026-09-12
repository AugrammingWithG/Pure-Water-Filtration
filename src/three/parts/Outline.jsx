import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A selection outline around a unit: its own hard edges, drawn in the accent
 * colour.
 *
 * The obvious alternative is an inverted hull — the shape grown slightly and
 * drawn back-faces-only, so the object covers all but the fringe. That was
 * tried first and abandoned. It relies on the object writing depth to hide the
 * shell's interior, and these units stop writing depth the moment the x-ray
 * fades their covers; masking the interior off with the stencil buffer instead
 * still left a fringe far wider than the shell's own geometry could account
 * for. Edges have none of that: they sit exactly on the surface, so they read
 * the same whether the cover is solid or see-through, and they need neither a
 * stencil pass nor a full-screen edge detect — which matters, because the
 * scene is fill-rate bound.
 *
 * Lines are drawn through drei's `Line` rather than `lineSegments` because
 * WebGL clamps native line width to a single pixel; this gives a real weight
 * that holds up at any zoom.
 */

/** Degrees between face normals before a shared edge counts as a hard one. */
const EDGE_THRESHOLD = 15
/**
 * Lifts the lines just off the surface they trace. Without it they z-fight
 * with the faces they sit on and stipple as the camera moves.
 */
const LIFT = 1.004

export default function Outline({ geometry, color, shown = true, width = 2.5, speed = 6 }) {
  const line = useRef()

  const points = useMemo(() => {
    const edges = new THREE.EdgesGeometry(geometry, EDGE_THRESHOLD)
    const position = edges.attributes.position
    const out = []
    for (let i = 0; i < position.count; i++) {
      out.push([position.getX(i), position.getY(i), position.getZ(i)])
    }
    edges.dispose()
    return out
  }, [geometry])

  useEffect(() => {
    const l = line.current
    if (l?.material) l.material.opacity = 0
  }, [])

  useFrame((_, delta) => {
    const material = line.current?.material
    if (!material) return
    material.opacity += ((shown ? 1 : 0) - material.opacity) * Math.min(1, delta * speed)
    material.visible = material.opacity > 0.01
  })

  return (
    <Line
      ref={line}
      points={points}
      segments
      scale={LIFT}
      color={color}
      lineWidth={width}
      transparent
      opacity={0}
      depthWrite={false}
      toneMapped={false}
    />
  )
}
