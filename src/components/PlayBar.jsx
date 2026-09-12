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
 * Transport for the walkthrough: play/pause, a scrubbable playhead across the
 * four stages, and the stage dots.
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
  const slider = useRef(null)
  const dragging = useRef(false)

  const index = STAGE_ORDER.indexOf(currentStage)
  const count = STAGE_ORDER.length
  const label = PLAY_LABEL[status]

  useEffect(
    () =>
      subscribe((fraction) => {
        const el = slider.current
        if (!el) return
        const pct = fraction * 100
        el.style.setProperty('--p', `${pct}%`)
        el.setAttribute('aria-valuenow', String(Math.round(pct)))
      }),
    [subscribe],
  )

  const seekAt = (e) => {
    const rect = slider.current.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    onScrub(Math.min(1, Math.max(0, fraction)))
  }

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    dragging.current = true
    slider.current.setPointerCapture(e.pointerId)
    onScrubStart()
    seekAt(e)
  }
  const onPointerMove = (e) => {
    if (dragging.current) seekAt(e)
  }
  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    onScrubEnd()
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
          ref={slider}
          className="progress"
          role="slider"
          tabIndex={0}
          aria-label="Walkthrough position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`Stage ${index + 1} of ${count}`}
          style={{ '--water': waterGradient(waterColours) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="progress-track">
            <div className="progress-fill" />
            {STAGE_ORDER.slice(1).map((key, i) => (
              <span
                key={key}
                className="progress-tick"
                style={{ left: `${((i + 1) / count) * 100}%` }}
              />
            ))}
          </div>
          <div className="progress-knob" />
        </div>

        <span className="stage-count">
          {status === 'paused' && (
            <>
              <b className="pb-state">Paused</b>{' '}
            </>
          )}
          Stage {index + 1} of {count}
        </span>
      </div>

      <div className="stage-dots">
        {STAGE_ORDER.map((key) => (
          <button
            key={key}
            className={`stage-dot-btn${key === currentStage ? ' active' : ''}`}
            onClick={() => onSelectStage(key)}
            data-stage={key}
          >
            <span className="dotmark" />
            <span>{dotLabelFor(key, currentSystem)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
