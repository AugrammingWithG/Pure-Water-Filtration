import { useEffect } from 'react'
import { useOrbitRig } from '../hooks/useOrbitRig'
import Grass from './Grass'
import Ground from './Ground'
import House from './House'
import Kitchen from './Kitchen'
import SceneEnvironment from './SceneEnvironment'
import WaterFlow from './WaterFlow'
import RainwaterUnit from './products/RainwaterUnit'
import UnderSinkUnit from './products/UnderSinkUnit'
import WholeHouseUnit from './products/WholeHouseUnit'
import { HOME_VIEW, SYSTEMS } from './systems'

const ORBIT_OPTIONS = {
  ...HOME_VIEW,
  minRadius: 1.1,
  maxRadius: 20,
  autoRotateSpeed: 0.04,
}

/**
 * Everything inside the <Canvas>. Owns the camera rig and publishes its
 * imperative API (flyTo/reset) to `rigRef` so the surrounding UI can drive
 * the camera without re-rendering the scene.
 */
export default function Scene({ currentSystem, currentStage, focused, onPick, rigRef }) {
  const rig = useOrbitRig(ORBIT_OPTIONS)
  const system = SYSTEMS[currentSystem]

  useEffect(() => {
    rigRef.current = rig
    return () => {
      rigRef.current = null
    }
  }, [rig, rigRef])

  /**
   * Products call this with a stage key (or null for "the unit as a whole").
   * A drag that happens to end on a mesh is not a pick — same 6px threshold
   * the rig uses to tell the two apart.
   */
  const pickFor = (systemKey) => (stageKey) => {
    if (!rig.wasClick()) return
    onPick(systemKey, stageKey)
  }

  const unitProps = (key) => ({
    active: currentSystem === key,
    /** covers go see-through only once the camera has flown in */
    revealed: focused && currentSystem === key,
    selectedStage: currentStage,
    accent: SYSTEMS[key].accentColor,
    onPick: pickFor(key),
  })

  return (
    <>
      <SceneEnvironment intensity={0.6} />

      <hemisphereLight args={[0xffffff, 0xd6dde4, 0.55]} />
      <directionalLight
        color={0xfff4e6}
        intensity={2.4}
        position={[7, 11, 6]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      {/* soft fill from the opposite side so the shadowed faces are not black */}
      <directionalLight color={0xdfe9f5} intensity={0.5} position={[-6, 5, -4]} />

      <Ground accent={system.accentColor} />
      <Grass accent={system.accentColor} />
      <House cutaway={focused && currentSystem === 'undersink'} />
      <Kitchen accent={SYSTEMS.undersink.accent} />

      <WholeHouseUnit {...unitProps('whole')} />
      <UnderSinkUnit {...unitProps('undersink')} />
      <RainwaterUnit {...unitProps('rain')} />

      <WaterFlow key={currentSystem} system={system} />
    </>
  )
}
