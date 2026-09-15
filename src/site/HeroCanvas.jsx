import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { DEFAULT_STAGE, DEFAULT_SYSTEM } from '../data/constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useQuality } from '../three/quality'
import Scene from '../three/Scene'
import { HOME_VIEW } from '../three/systems'

/** The hero has no interface standing on the canvas, so nothing to keep clear of. */

/**
 * The home view, from further back. The viewer's framing fills its window
 * with the house and lets the plinth run off the edges; in the hero the
 * diorama is an object on the page, and wants air around it.
 *
 * Less far back once the page has stacked into one column: the canvas is
 * nearly square there, and the rig already pulls the camera out to hold the
 * plinth's width in a narrow frame (see Scene.jsx). Stacking the two would
 * leave the diorama a small thing in the middle of a tall empty band.
 */
const HERO_VIEW = { ...HOME_VIEW, radius: 18.5 }
const HERO_VIEW_STACKED = { ...HOME_VIEW, radius: 15 }

/**
 * The diorama, live in the hero: the same <Scene> the Water Lab renders,
 * at its opening framing with the guided tour and the cards left out. The
 * canvas is transparent, so the house sits straight on the page gradient
 * with nothing framing it.
 *
 * Renderer settings match SimCanvas for the same reasons given there: the
 * scene is fill-rate bound, so the dpr cap matters more than anything else,
 * and three r186 dropped PCFSoftShadowMap.
 *
 * `running` drives the frame loop. Off-screen, or under the open Water Lab,
 * the hero would otherwise keep drawing a scene nobody can see, which on a
 * phone is a battery spent on nothing.
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
export default function HeroCanvas({ running, onReady, onPick }) {
  const { dpr } = useQuality()
  const rigRef = useRef(null)
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
        toneMappingExposure: 1.05,
      }}
      camera={{ fov: 40, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.debug.checkShaderErrors = import.meta.env.DEV
      }}
    >
      <Suspense fallback={null}>
        <Scene
          currentSystem={DEFAULT_SYSTEM}
          currentStage={DEFAULT_STAGE}
          focused={false}
          paused={false}
          onPick={onPick}
          onReady={onReady}
          rigRef={rigRef}
          wheelZoom={false}
          view={stacked ? HERO_VIEW_STACKED : HERO_VIEW}
        />
      </Suspense>
    </Canvas>
  )
}
