import { useMemo } from 'react'
import * as THREE from 'three'
import { KITCHEN, UNDERSINK_UNIT } from '../layout'
import CarbonAbsorption from './CarbonAbsorption'
import MembraneSplit from './MembraneSplit'
import OutputSparkle from './OutputSparkle'
import SedimentCapture from './SedimentCapture'

/**
 * What the under-sink unit does, stage by stage.
 *
 * Stages one, two and four are the same jobs the whole-house unit does, so
 * they run the same components at this unit's much smaller gauge. Stage three
 * is not: this is reverse osmosis, which rejects what it removes to drain
 * rather than holding it, so it gets its own mechanic. See MembraneSplit.
 *
 *   1 sediment — exclusion:  grit stopped at the face, bed loads up
 *   2 carbon   — absorption: dissolved chlorine soaked into the block
 *   3 RO       — rejection:  dissolved solids split off and sent to drain
 *   4 output   — delivery:   finished water glints on its way to the tap
 *
 * Everything is measured off path.mediaSpans, the same spans that drive the
 * colour ramp, so an effect always fires where the water actually changes.
 */

/**
 * The narrowest pipe the route runs inside on this unit — the 0.011 poly
 * tubing between cartridges. The chlorine tint is held inside it so the
 * sleeve never bulges out through the tube.
 */
const TUBING_BORE = 0.011

export default function UnderSinkEffects({ system }) {
  const { path, pulseRadius } = system
  const radius = UNDERSINK_UNIT.canisterR

  /**
   * Where the RO reject goes. A real unit tees its reject line into the sink
   * tailpiece above the trap, so this runs from under the membrane, across
   * the back of the cabinet, and up to the drain the Kitchen already models.
   */
  const rejectPoints = useMemo(() => {
    const us = UNDERSINK_UNIT
    const membraneX = us.canisterXs[2]
    const below = us.bracketY - us.canisterH - 0.09
    const drainX = KITCHEN.sinkX + 0.12
    const drainY = KITCHEN.counterY - 0.21
    const drainZ = KITCHEN.zBack + 0.03
    return [
      new THREE.Vector3(membraneX, below + 0.05, us.z),
      new THREE.Vector3(membraneX, below, us.z),
      new THREE.Vector3(drainX, below, drainZ),
      new THREE.Vector3(drainX, drainY, drainZ),
    ]
  }, [])

  return (
    <>
      <SedimentCapture path={path} radius={radius} streamRadius={pulseRadius} />
      <CarbonAbsorption
        path={path}
        radius={radius}
        streamRadius={pulseRadius}
        bore={TUBING_BORE}
      />
      <MembraneSplit
        path={path}
        rejectPoints={rejectPoints}
        radius={radius}
        streamRadius={pulseRadius}
      />
      <OutputSparkle path={path} from={path.mediaSpans[path.stageOrder[2]][1]} />
    </>
  )
}
