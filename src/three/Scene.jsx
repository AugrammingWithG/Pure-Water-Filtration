import { useEffect } from 'react'
import * as THREE from 'three'
import { useOrbitRig } from '../hooks/useOrbitRig'
import { LEGACY_LIGHT_SCALE } from './lighting'
import { CANISTERS } from './waterline'
import Canister from './Canister'
import House from './House'
import ServiceLine from './ServiceLine'
import TapAssembly from './TapAssembly'
import WaterFlow from './WaterFlow'

/** Opening framing — roughly chest height at the middle of the house. */
const ORBIT_TARGET = new THREE.Vector3(-0.4, 1.1, -0.2)
const ORBIT_OPTIONS = {
  target: ORBIT_TARGET,
  radius: 9.8,
  theta: 0.75,
  phi: 1.2,
  minRadius: 2.5,
  maxRadius: 15,
}

/**
 * Everything inside the <Canvas>. Owns the camera rig and publishes its
 * imperative API (focus/reset) to `rigRef` so the surrounding UI can drive
 * the camera without re-rendering the scene.
 */
export default function Scene({ currentStage, onSelectStage, rigRef }) {
  const rig = useOrbitRig(ORBIT_OPTIONS)

  useEffect(() => {
    rigRef.current = rig
    return () => {
      rigRef.current = null
    }
  }, [rig, rigRef])

  /**
   * Suppress selection when the pointer was dragged: the same 6px threshold
   * the legacy rig used before it fired its raycast. stopPropagation keeps
   * only the nearest hit, matching the old `hits[0]` behaviour.
   */
  const pick = (stageKey) => (event) => {
    event.stopPropagation()
    if (!rig.wasClick()) return
    onSelectStage(stageKey)
  }

  return (
    <>
      <fogExp2 attach="fog" args={[0x050f1c, 0.045]} />

      <ambientLight color={0x2a3f55} intensity={1.2 * LEGACY_LIGHT_SCALE} />
      <directionalLight
        color={0x9fd8ff}
        intensity={0.45 * LEGACY_LIGHT_SCALE}
        position={[4, 6, 3]}
      />

      <gridHelper args={[20, 20, 0x1c3654, 0x101f36]} position={[0, 0, 0]} />

      <House />
      <ServiceLine />

      {CANISTERS.map((c) => (
        <Canister
          key={c.key}
          position={c.position}
          color={c.color}
          radius={c.radius}
          height={c.height}
          selected={currentStage === c.key}
          onClick={pick(c.key)}
        />
      ))}

      <TapAssembly selected={currentStage === 'tap'} onClick={pick('tap')} />

      <WaterFlow />
    </>
  )
}
