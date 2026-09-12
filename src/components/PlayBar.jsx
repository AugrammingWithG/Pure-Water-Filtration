import { useEffect, useRef } from 'react'
import { dotLabelFor, STAGE_ORDER } from '../data/constants'
import { PlayPauseIcon } from './icons'

const PLAY_LABEL = {
  idle: 'Play walkthrough',
  playing: 'Pause walkthrough',
  paused: 'Resume walkthrough',
}

/**
 * How much of each stage's stretch of the bar holds the colour the water
 * arrived with before it starts clearing: the run of pipe into the cartridge.
 */
const APPROACH = 0.4

/**
 * The bar's colours follow the water's — one per stage, raw first, the same
 * list the route itself is painted with — so the bar is the journey in
 * miniature: it holds each colour on the way in, then clears across the
 * stage. The last stage has nothing left to clear, so its colour runs out.
 */
function waterGradient(colours) {
  const n = colours.length
  const stops = colours.flatMap((c, i) => {
    const hex = `#${c.toString(16).padStart(6, '0')}`
    const start = (i / n) * 100
    const hold = start + (100 / n) * APPROACH
    return [`${hex} ${start}%`, `${hex} ${hold}%`]
  })
  return `linear-gradient(90deg, ${stops.join(', ')})`
}

/**
 * Transport for the walkthrough: play/pause and the stage timeline — a
 * scrubbable playhead with the four stages marked along it.
 *
 * Each stage is a marker on the track where it begins, with its name in the
 * stretch that follows. Tapping a marker or a name puts the playhead exactly
 * on that stage's start, and the tour goes there; dragging anywhere along the
 * track scrubs. The stage the playhead is inside is the live one, so the
 * highlighted marker is always the stage on screen — whether the tour put it
 * there, a scrub did, or a click in the scene.
 *
 * The playhead moves every frame, so it is driven through the DOM — the
 * position arrives via `subscribe` and lands in a CSS variable the fill and
 * the knob both read — rather than through React state, which would re-render
 * the whole app, canvas included, sixty times a second.
 */
export default function PlayBar({
  currentStage,
  currentSystem,
  status,
  waterColours,
  onTogglePlay,
  onSelectStage,
  onScrub,
  onScrubStart,
  onScrubEnd,
  subscribe,
}) {
  const timeline = useRef(null)
  const slider = useRef(null)
  const dragging = useRef(false)

  const index = STAGE_ORDER.indexOf(currentStage)
  const count = STAGE_ORDER.length
  const label = PLAY_LABEL[status]

  useEffect(
    () =>
      subscribe((fraction) => {
        const el = timeline.current
        if (!el) return
        const pct = fraction * 100
        el.style.setProperty('--p', `${pct}%`)
        slider.current?.setAttribute('aria-valuenow', String(Math.round(pct)))
      }),
    [subscribe],
  )

  const seekAt = (e) => {
    const rect = timeline.current.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    onScrub(Math.min(1, Math.max(0, fraction)))
  }

  /**
   * A press anywhere on the timeline starts a scrub. On a stage's marker or
   * name it starts from that stage's exact beginning rather than from
   * wherever under the marker the finger landed — a marker a few pixels wide
   * would otherwise put the playhead just short of the stage it names, and
   * so on the stage before. Dragging on from there scrubs like anywhere else.
   */
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    dragging.current = true
    timeline.current.setPointerCapture(e.pointerId)
    onScrubStart()
    const stage = e.target.closest('[data-stage]')?.dataset.stage
    if (stage) onSelectStage(stage)
    else seekAt(e)
  }
  const onPointerMove = (e) => {
    if (dragging.current) seekAt(e)
  }
  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    onScrubEnd()
  }

  /**
   * The markers are buttons so they can be reached and pressed from the
   * keyboard. A pointer press has already been handled above; a keyboard
   * activation arrives as a click with no pointer behind it (detail 0).
   */
  const onStageClick = (e, key) => {
    if (e.detail === 0) onSelectStage(key)
  }

  return (
    <div className="playbar-wrap">
      <div className={`playbar ${status}`}>
        <button
          className="play-btn"
          onClick={onTogglePlay}
          aria-label={label}
          title={`${label} (Space)`}
        >
          <PlayPauseIcon playing={status === 'playing'} />
        </button>

        <div
          ref={timeline}
          className="progress"
          style={{ '--water': waterGradient(waterColours) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={slider}
            className="progress-slider"
            role="slider"
            tabIndex={0}
            aria-label="Walkthrough position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Stage ${index + 1} of ${count}`}
          >
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
            <div className="progress-knob" />
          </div>

          <div className="progress-stages">
            {STAGE_ORDER.map((key, i) => (
              <button
                key={key}
                type="button"
                className={`progress-stage${key === currentStage ? ' active' : ''}${
                  i < index ? ' passed' : ''
                }`}
                style={{ left: `${(i / count) * 100}%`, width: `${100 / count}%` }}
                data-stage={key}
                aria-current={key === currentStage ? 'step' : undefined}
                title={`Go to stage ${i + 1}`}
                onClick={(e) => onStageClick(e, key)}
              >
                <span className="progress-marker" />
                <span className="progress-label">{dotLabelFor(key, currentSystem)}</span>
              </button>
            ))}
          </div>
        </div>

        <span className="stage-count">
          {status === 'paused' && (
            <>
              <b className="pb-state">Paused</b>{' '}
            </>
          )}
          <span className="stage-count-text">
            Stage {index + 1} of {count}
          </span>
        </span>
      </div>
    </div>
  )
}
