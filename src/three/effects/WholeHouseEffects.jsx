import { WHOLE_UNIT } from '../layout'
import CarbonAbsorption from './CarbonAbsorption'
import MineralBalance from './MineralBalance'
import OutputSparkle from './OutputSparkle'
import SedimentCapture from './SedimentCapture'

/**
 * What the whole-house unit actually does, stage by stage. Each stage gets its
 * own mechanic rather than one shared "specks vanish" effect, because the four
 * jobs are not the same kind of job:
 *
 *   1 sediment — exclusion:  grit is stopped and piles up
 *   2 carbon   — absorption: dissolved chlorine is soaked into the block
 *   3 minerals — balancing:  one blob is reshaped, nothing is taken out
 *   4 output   — delivery:   the finished water glints on its way to the taps
 *
 * These sit on top of WaterFlow rather than replacing any of it: WaterFlow
 * carries the route, the stream and the fine sediment, and stage 1 here adds
 * only the coarse grains it does not.
 *
 * Every span comes from path.mediaSpans, the same measurement that drives the
 * colour ramp, so an effect always fires exactly where the water changes.
 */
export default function WholeHouseEffects({ system }) {
  const { path, pulseRadius } = system
  const radius = WHOLE_UNIT.canisterRadius

  return (
    <>
      <SedimentCapture path={path} radius={radius} streamRadius={pulseRadius} />
      <CarbonAbsorption path={path} radius={radius} streamRadius={pulseRadius} />
      <MineralBalance path={path} />
      <OutputSparkle
        path={path}
        from={path.mediaSpans[path.stageOrder[2]][1]}
        streamRadius={pulseRadius}
      />
    </>
  )
}
