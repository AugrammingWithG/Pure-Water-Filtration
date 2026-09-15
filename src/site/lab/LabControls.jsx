import { useEffect, useRef } from 'react'
import { HouseIcon, PlayPauseIcon, RainIcon, TapIcon } from '../../components/icons'
import { waterGradient } from '../../components/waterGradient'
import {
  dotLabelFor,
  SIDEBAR_LABELS,
  STAGE_DATA_BY_SYSTEM,
  STAGE_ORDER,
  SYSTEM_DATA,
  SYSTEM_ORDER,
} from '../../data/constants'
import { WATER_COLOURS } from '../../three/waterColours'

const SYSTEM_ICONS = { whole: HouseIcon, undersink: TapIcon, rain: RainIcon }

const PLAY_LABEL = {
  idle: 'Play the walkthrough',
  playing: 'Pause the walkthrough',
  paused: 'Resume the walkthrough',
}

/**
 * The three things the Lab lets you do, each as the control that does it.
 * The old cards described these steps in prose beside a picture; now the
 * picture is live, and each card is the way to take that step — pick a
 * system, play the water through, read what the stage on screen removes —
 * so the section teaches by being used rather than by being read.
 *
 * Everything here reads from and writes to the one `lab` state, so a click
 * in the scene lights the matching card, and a card lights the scene.
 */
export default function LabControls({ lab }) {
  const { currentSystem, currentStage, status } = lab
  const system = SYSTEM_DATA[currentSystem]
  const stage = STAGE_DATA_BY_SYSTEM[currentSystem][currentStage]
  const stageIndex = STAGE_ORDER.indexOf(currentStage)
  const count = STAGE_ORDER.length

  /**
   * The playhead moves every frame, so it lands in a CSS variable the
   * timeline's fill reads, never in React state — a re-render at that rate
   * would reach the canvas.
   */
  const timeline = useRef(null)
  const { subscribe } = lab
  useEffect(
    () =>
      subscribe((fraction) => {
        timeline.current?.style.setProperty('--p', `${fraction * 100}%`)
      }),
    [subscribe],
  )

  return (
    <div className="lab-info">
      <article className="lab-card reveal delay1">
        <div className="lab-card-head">
          <div className="kicker">01</div>
          <h3>Pick a system.</h3>
        </div>
        <div className="lab-systems" role="group" aria-label="Filtration system">
          {SYSTEM_ORDER.map((key) => {
            const Icon = SYSTEM_ICONS[key]
            const active = key === currentSystem
            return (
              <button
                key={key}
                type="button"
                className={`lab-sys${active ? ' active' : ''}`}
                aria-pressed={active}
                onClick={() => lab.selectSystem(key)}
              >
                <Icon />
                <span>{SIDEBAR_LABELS[key]}</span>
              </button>
            )
          })}
        </div>
        <p className="lab-placement" key={currentSystem}>
          {system.placement}
        </p>
      </article>

      {/* status is a data attribute: the reveal observer's `visible` class must survive re-renders */}
      <article className="lab-card lab-card-water reveal delay2" data-status={status}>
        <div className="lab-card-head">
          <div className="kicker">02</div>
          <h3>Follow the water.</h3>
        </div>
        <div className="lab-transport">
          <button
            type="button"
            className="lab-play"
            onClick={lab.togglePlay}
            aria-label={PLAY_LABEL[status]}
            title={PLAY_LABEL[status]}
          >
            <PlayPauseIcon playing={status === 'playing'} />
          </button>
          <div
            className="lab-timeline"
            ref={timeline}
            style={{ '--water': waterGradient(WATER_COLOURS[currentSystem]) }}
          >
            <div className="lab-track">
              <div className="lab-fill" />
            </div>
            <div className="lab-stops">
              {STAGE_ORDER.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  className={`lab-stop${key === currentStage ? ' active' : ''}${
                    i < stageIndex ? ' passed' : ''
                  }`}
                  aria-current={key === currentStage ? 'step' : undefined}
                  onClick={() => lab.selectStageOf(key)}
                >
                  <span className="lab-marker" />
                  <span className="lab-stop-label">{dotLabelFor(key, currentSystem)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="lab-status">
          {status === 'idle' ? (
            'Press play, or pick a stage, and the camera follows the water.'
          ) : (
            <>
              <b>{status === 'playing' ? 'Playing' : 'Paused'}</b> · Stage {stageIndex + 1} of{' '}
              {count}
            </>
          )}
        </p>
      </article>

      <article className="lab-card reveal delay3">
        <div className="lab-card-head">
          <div className="kicker">03</div>
          <h3>See what each stage removes.</h3>
        </div>
        <div className="lab-removes" key={`${currentSystem}-${currentStage}`}>
          <div className="lab-stage-name">
            <b>Stage {stageIndex + 1}</b>
            <span>{stage.title}</span>
          </div>
          <div className="lab-chips">
            <span className="lab-action">{stage.action}</span>
            {stage.removes.map((item, i) => (
              <span className="lab-chip" style={{ '--i': i }} key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
