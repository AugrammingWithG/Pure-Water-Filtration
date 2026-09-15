import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useQuality } from '../three/quality'
import HeroProductScene from './HeroProductScene'

/**
 * The hero canvas: a cinematic product render of the whole-house unit on
 * a clean interior wall. Fixed camera, no orbit — the canvas is the hero's
 * backdrop and the section's copy overlays it.
 *
 * Renderer settings match SimCanvas: the scene is fill-rate bound so the
 * dpr cap matters more than anything else, and three r186 dropped
 * PCFSoftShadowMap. `running` drives the frame loop — off-screen or under
 * the open Water Lab, the canvas draws nothing.
 *
 * The scene's textures and environment map load through suspense, and the
 * boundary that catches them is deliberately *inside* the canvas. Left to
 * r3f, the <Canvas> element re-throws into the page tree, and the hero's
 * own boundary hides and reveals the canvas while they load. On reveal,
 * React's StrictMode simulates an unmount and remount of the revealed
 * subtree's effects — which runs r3f's teardown against the live renderer
 * and force-loses its WebGL context half a second later. The page then
 * shows a blank hero in development, and only in development. Catching the
 * load here means the canvas element never suspends and nothing above it
 * ever hides it.
 */
export default function HeroCanvas({ running, onReady }) {
  const { dpr } = useQuality()
  /** Same breakpoint the stylesheet stacks the hero at. */
  const stacked = useMediaQuery('(max-width: 900px)')
  return (
    <Canvas
      className="hero-canvas"
      frameloop={running ? 'always' : 'never'}
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, dpr]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0.85, 1.55, 2.35] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.debug.checkShaderErrors = import.meta.env.DEV
      }}
    >
      <Suspense fallback={null}>
        <HeroProductScene stacked={stacked} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
