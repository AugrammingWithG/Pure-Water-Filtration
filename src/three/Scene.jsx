import { useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useOrbitRig } from '../hooks/useOrbitRig'
import Grass from './Grass'
import Ground from './Ground'
import House from './House'
import Kitchen from './Kitchen'
import Lighting from './Lighting'
import Precompile from './Precompile'
import QualityGovernor from './QualityGovernor'
import SceneEnvironment from './SceneEnvironment'
import StageCard from './StageCard'
import StatCards from './StatCards'
import StageMarkers from './StageMarkers'
import Trees from './Trees'
import WaterFlow from './WaterFlow'
import RainwaterEffects from './effects/RainwaterEffects'
import UnderSinkEffects from './effects/UnderSinkEffects'
import WholeHouseEffects from './effects/WholeHouseEffects'
import RainwaterUnit from './products/RainwaterUnit'
import UnderSinkUnit from './products/UnderSinkUnit'
import WholeHouseUnit from './products/WholeHouseUnit'
import { HOUSE_OCCLUDER, OCCLUDERS } from './parts/useAnchorVisible'
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
 * How far the reader can get from the kitchen before the house closes back up,
 * in scene units.
 *
 * The kitchen views sit at 2.7 for the unit and 1.7 for a stage; the house is
 * 6.4 x 3.4, so from about 4.5 out the whole building is in frame and the sink
 * is no longer what you are looking at. The gap between the two numbers is
 * hysteresis — a single wheel notch is about 1 unit, and without the gap
 * resting on the threshold would flap the roof on and off.
 */
const CUTAWAY_CLOSE = 4.5
const CUTAWAY_OPEN = 5.5

/** What the house is opened to show. */
const KITCHEN = SYSTEMS.undersink.view.target

/**
 * True while the reader is close enough to the kitchen for the house to be
 * worth opening.
 *
 * The cutaway used to follow `focused` on its own, so once the camera had
 * flown to the sink the roof stayed off however far the reader pulled back —
 * a house with no roof, and nothing to suggest that Reset view was the way to
 * put it back when all they had done was zoom.
 *
 * "How far away" is the orbit distance plus however far a two-finger pan has
 * dragged the look-at point off the sink, so backing out and wandering off
 * both close the house. They are summed rather than measured from the camera's
 * own position because a sum has no orbit angle in it: taken from the camera,
 * the near and far sides of a panned target differ by twice the radius, and
 * the roof would flap as the reader swung round. The pan is divided by the
 * narrow-viewport pullback for the same reason `radius` is read before it —
 * so the same drag across the same screen means the same thing on a phone as
 * on a desktop.
 *
 * Sampled per frame rather than derived from state because the rig keeps both
 * numbers in a ref: they change on the wheel, on a two-finger drag and
 * mid-tween, none of which pass through React.
 */
function useNearHouse(rig, enabled, scale) {
  const [near, setNear] = useState(false)
  useFrame(() => {
    if (!enabled) {
      if (near) setNear(false)
      return
    }
    const away = rig.radius + rig.target.distanceTo(KITCHEN) / scale
    if (near ? away > CUTAWAY_OPEN : away < CUTAWAY_CLOSE) setNear(!near)
  })
  // `enabled` leads the frame loop by one frame on the way down; and it is the
  // more authoritative of the two anyway.
  return enabled && near
}

/**
 * Everything inside the <Canvas>. Owns the camera rig and publishes its
 * imperative API (flyTo/reset) to `rigRef` so the surrounding UI can drive
 * the camera without re-rendering the scene.
 */
export default function Scene({
  currentSystem,
  currentStage,
  focused,
  paused,
  subscribe,
  cardContent,
  showCard,
  figures,
  showStats,
  compact,
  insets,
  onPick,
  onReady,
  rigRef,
}) {
  const { width, height } = useThree((s) => s.size)
  const distanceScale = Math.min(
    MAX_PULLBACK,
    Math.max(1, FRAME_ASPECT / (width / height)),
  )

  const rig = useOrbitRig({ ...ORBIT_OPTIONS, distanceScale })
  const system = SYSTEMS[currentSystem]
  const cutaway = useNearHouse(
    rig,
    focused && currentSystem === 'undersink',
    distanceScale,
  )

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
      <QualityGovernor />
      <SceneEnvironment intensity={0.2} />
      <Lighting accent={system.accentColor} />

      <Ground accent={system.accentColor} />
      <Grass accent={system.accentColor} />
{/*
        Named so the cards can ask whether the thing they are about is behind
        any of it. Only the scenery goes in: a product must not be counted as
        hiding its own card, and the ground and grass are never between the
        camera and a unit. The house is named separately because a view that
        opens it up stops it counting. See parts/useAnchorVisible.
      */}
      <group name={OCCLUDERS}>
        <Trees />
      </group>
      <group name={HOUSE_OCCLUDER}>
        <House cutaway={cutaway} />
      </group>
      <Kitchen accent={SYSTEMS.undersink.accent} />

      <WholeHouseUnit {...unitProps('whole')} />
      <UnderSinkUnit {...unitProps('undersink')} />
      <RainwaterUnit {...unitProps('rain')} />

      <WaterFlow
        key={currentSystem}
        system={system}
        currentStage={currentStage}
        paused={paused}
        subscribe={subscribe}
      />
      <StageMarkers
        system={system}
        currentStage={currentStage}
        onPick={pickFor(currentSystem)}
      />
      {showCard && cardContent && (
        <StageCard
          system={system}
          currentStage={currentStage}
          content={cardContent}
          viewScale={distanceScale}
          houseOpen={cutaway}
        />
      )}
      <StatCards
        system={system}
        figures={figures}
        visible={showStats}
        compact={compact}
        insets={insets}
        viewScale={distanceScale}
        houseOpen={cutaway}
      />
      {currentSystem === 'whole' && <WholeHouseEffects system={system} />}
      {currentSystem === 'undersink' && <UnderSinkEffects system={system} />}
      {currentSystem === 'rain' && <RainwaterEffects system={system} />}

      <Precompile onReady={onReady} />
    </>
  )
}
