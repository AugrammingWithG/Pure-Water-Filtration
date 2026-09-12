import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useOrbitRig } from '../hooks/useOrbitRig'
import Grass from './Grass'
import Ground from './Ground'
import House from './House'
import Kitchen from './Kitchen'
import Lighting from './Lighting'
import SceneEnvironment from './SceneEnvironment'
import StageMarkers from './StageMarkers'
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
 * The camera's fov is vertical, so how much of the scene fits across the frame
 * depends on the viewport's aspect: a phone in portrait sees a far narrower
 * slice than a desktop does from the same distance, and the plinth ends up
 * cropped. Every view in systems.js is framed for a landscape viewport, so
 * below this aspect the rig pulls back to hold the same width in frame.
 * 1.5 is the aspect at which the home view just contains the plinth.
 */
const FRAME_ASPECT = 1.5
/** Far enough for a tall phone; past that, let the edges crop. */
const MAX_PULLBACK = 2

/**
 * Everything inside the <Canvas>. Owns the camera rig and publishes its
 * imperative API (flyTo/reset) to `rigRef` so the surrounding UI can drive
 * the camera without re-rendering the scene.
 */
export default function Scene({ currentSystem, currentStage, focused, onPick, rigRef }) {
  const { width, height } = useThree((s) => s.size)
  const distanceScale = Math.min(
    MAX_PULLBACK,
    Math.max(1, FRAME_ASPECT / (width / height)),
  )

  const rig = useOrbitRig({ ...ORBIT_OPTIONS, distanceScale })
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
      <SceneEnvironment intensity={0.55} />
      <Lighting accent={system.accentColor} />

      <Ground accent={system.accentColor} />
      <Grass accent={system.accentColor} />
      <House cutaway={focused && currentSystem === 'undersink'} />
      <Kitchen accent={SYSTEMS.undersink.accent} />

      <WholeHouseUnit {...unitProps('whole')} />
      <UnderSinkUnit {...unitProps('undersink')} />
      <RainwaterUnit {...unitProps('rain')} />

      <WaterFlow key={currentSystem} system={system} currentStage={currentStage} />
      <StageMarkers
        system={system}
        currentStage={currentStage}
        onPick={pickFor(currentSystem)}
      />
    </>
  )
}
