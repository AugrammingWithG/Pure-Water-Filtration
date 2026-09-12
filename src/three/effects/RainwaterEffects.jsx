import CarbonAbsorption from './CarbonAbsorption'
import OutputSparkle from './OutputSparkle'
import SedimentCapture from './SedimentCapture'
import UvSterilise from './UvSterilise'

/**
 * What the rainwater unit does, stage by stage.
 *
 * Two things set this system apart from the other two, and both fall out of
 * the route rather than needing special cases here:
 *
 *   - its carbon stage runs *two* cartridges in series, so CarbonAbsorption
 *     reads its elements off the media legs and steps the chlorine tint down
 *     once per block instead of clearing it in one go
 *   - its third stage is UV, which kills without removing, so it gets
 *     UvSterilise rather than the whole-house blob or the under-sink membrane
 *
 *   1 sediment — exclusion:      leaf litter and tank grit stopped at the face
 *   2 carbon   — absorption:     taste and odour soaked into two blocks
 *   3 UV       — sterilisation:  bacteria killed in place, not taken out
 *   4 output   — delivery:       safe water glinting on its way indoors
 */

/** Cartridge bore on this unit, and the copper the route runs between them. */
const CANISTER_RADIUS = 0.07
const PIPE_BORE = 0.036
/** The UV lamp is a narrow sleeve, not a cartridge. */
const UV_RADIUS = 0.042

export default function RainwaterEffects({ system }) {
  const { path, pulseRadius } = system

  return (
    <>
      <SedimentCapture path={path} radius={CANISTER_RADIUS} streamRadius={pulseRadius} />
      <CarbonAbsorption
        path={path}
        radius={CANISTER_RADIUS}
        streamRadius={pulseRadius}
        bore={PIPE_BORE}
      />
      <UvSterilise path={path} radius={UV_RADIUS} streamRadius={pulseRadius} />
      <OutputSparkle path={path} from={path.mediaSpans[path.stageOrder[2]][1]} />
    </>
  )
}
