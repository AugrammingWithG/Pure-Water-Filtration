import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DetailCard from './components/DetailCard'
import MobileSheet from './components/MobileSheet'
import FactsCard from './components/FactsCard'
import Header from './components/Header'
import PlayBar from './components/PlayBar'
import Sidebar from './components/Sidebar'
import SimCanvas from './components/SimCanvas'
import StatsCard from './components/StatsCard'
import WhyCard from './components/WhyCard'
import {
  DEFAULT_STAGE,
  MVP_FIGURES,
  DEFAULT_SYSTEM,
  STAGE_DATA_BY_SYSTEM,
  STAGE_DWELL_MS,
  STAGE_ORDER,
  SYSTEM_DATA,
} from './data/constants'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useUiInsets } from './hooks/useUiInsets'
import { useWalkthrough } from './hooks/useWalkthrough'
import { stageView, SYSTEMS } from './three/systems'
/*
 * The viewer's stylesheet travels with the viewer rather than with the page:
 * App is loaded on demand from the Water Lab modal, so its CSS arrives in the
 * same chunk and a visitor who never opens the lab never downloads either.
 */
import './styles/index.css'

/** Camera fly-to duration for a stage; a little longer when changing system. */
const STAGE_FLY_MS = 850
const SYSTEM_FLY_MS = 1100

export default function App() {
  const [currentSystem, setCurrentSystem] = useState(DEFAULT_SYSTEM)
  const [currentStage, setCurrentStage] = useState(DEFAULT_STAGE)
  /**
   * False at the wide opening view, true once the camera has flown to a
   * product or stage. Drives the x-ray covers and the house cutaway, so the
   * diorama stays intact until the user asks to look inside something.
   */
  const [focused, setFocused] = useState(false)

  /** Where the detail card stops floating and becomes a bottom sheet. */
  const compact = useMediaQuery('(max-width: 620px)')

  /**
   * Which tab the phone sheet is on: the stage, the product, or the company.
   *
   * Nothing moves it but the reader. An earlier version pulled it back to the
   * stage tab whenever a stage was picked, on the theory that asking for a
   * stage is asking to see it — but in the hand that reads as the sheet
   * fighting you, because stepping through the stages while reading the
   * product tab is a perfectly ordinary thing to want. Leaving it alone also
   * means the sidebar can be used to compare one product against another with
   * the figures still on screen.
   */
  const [sheetPage, setSheetPage] = useState(0)

  /**
   * The whole app, which is also the canvas: the scene fills it and every
   * piece of interface sits on top. Measured so the floating cards can be
   * placed against the real header, rail and play bar (as CSS variables)
   * rather than against a guess at them.
   */
  const stageRef = useRef(null)
  useUiInsets(stageRef)

  /** Imperative handle on the camera rig, published by <Scene>. */
  const rigRef = useRef(null)

  /** Mirror the walkthrough can read without being rebuilt on every change. */
  const systemRef = useRef(currentSystem)
  useEffect(() => {
    systemRef.current = currentSystem
  }, [currentSystem])

  /** Show a stage: select it and fly the camera to it. */
  const selectStage = useCallback((systemKey, stageKey) => {
    setCurrentStage(stageKey)
    setFocused(true)
    rigRef.current?.flyTo(stageView(systemKey, stageKey), STAGE_FLY_MS)
  }, [])

  /**
   * The guided tour. Its playhead decides which stage is showing while it
   * runs; the water in the scene freezes with it when it is paused.
   */
  const walkthrough = useWalkthrough({
    stages: STAGE_ORDER.length,
    dwell: STAGE_DWELL_MS / 1000,
    onStage: (index) => selectStage(systemRef.current, STAGE_ORDER[index]),
  })
  const { status, play, pause, stop, seekStage } = walkthrough

  /**
   * A stage the user asked for — from the bar, the keyboard or the scene. The
   * tour seeks to it and carries on as it was: still playing, or still paused
   * but now looking here. Only leaving the system ends the tour.
   */
  const pickStage = useCallback(
    (systemKey, stageKey) => {
      seekStage(STAGE_ORDER.indexOf(stageKey))
      selectStage(systemKey, stageKey)
    },
    [seekStage, selectStage],
  )

  /**
   * Play from rest flies straight in to the stage the playhead is on, rather
   * than sitting at the wide view until the first stage change. It never moves
   * the playhead: the knob is the position, and where the user last scrubbed
   * it to is where the tour picks up — a marker is the way to ask for the
   * start of a stage. Resuming from a pause does not touch the camera: the
   * user may have orbited to look at something while the water was held, and
   * it should stay there until the tour moves on.
   */
  const handleTogglePlay = useCallback(() => {
    if (status === 'playing') {
      pause()
      return
    }
    if (status === 'idle') selectStage(systemRef.current, currentStage)
    play()
  }, [status, currentStage, selectStage, play, pause])

  const handleStageMarker = useCallback((key) => pickStage(systemRef.current, key), [pickStage])

  /**
   * Sidebar: switch system and fly the camera to that product. Clicking the
   * system that is already active still flies there, so it doubles as a
   * "take me to it" button after the user has orbited away.
   */
  const handleSelectSystem = useCallback(
    (key) => {
      setCurrentSystem(key)
      stop()
      setFocused(true)
      rigRef.current?.flyTo(SYSTEMS[key].view, SYSTEM_FLY_MS)
    },
    [stop],
  )

  /**
   * Clicking a product in the scene. A stage key focuses that part (and
   * switches system if the part belongs to another one); null means the
   * unit as a whole was clicked, which behaves like the sidebar button.
   */
  const handleScenePick = useCallback(
    (systemKey, stageKey) => {
      if (stageKey === null) {
        handleSelectSystem(systemKey)
        return
      }
      setCurrentSystem(systemKey)
      pickStage(systemKey, stageKey)
    },
    [handleSelectSystem, pickStage],
  )

  const handleResetView = useCallback(() => {
    stop()
    setFocused(false)
    rigRef.current?.reset()
  }, [stop])

  /**
   * Transport keys: space plays and pauses; the arrows step between stages,
   * Home and End jump to the first and last. Left alone while the user is
   * typing, and space is left to a focused button — it already clicks that,
   * and the play button is one of them.
   */
  useEffect(() => {
    const last = STAGE_ORDER.length - 1
    const onKeyDown = (e) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      const tag = e.target.tagName
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target.isContentEditable) return

      const index = STAGE_ORDER.indexOf(currentStage)
      let next
      if (e.code === 'Space') {
        if (tag === 'BUTTON') return
        e.preventDefault()
        handleTogglePlay()
        return
      } else if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
      else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = last
      else return

      e.preventDefault()
      pickStage(systemRef.current, STAGE_ORDER[next])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentStage, handleTogglePlay, pickStage])

  const system = SYSTEM_DATA[currentSystem]
  const stage = STAGE_DATA_BY_SYSTEM[currentSystem][currentStage]
  const stageIndex = STAGE_ORDER.indexOf(currentStage)

  /** Placeholder figures for the stats card. See MVP_FIGURES. */
  const figures = MVP_FIGURES[currentSystem]

  /** One description of the current stage, whichever card ends up showing it. */
  const cardContent = useMemo(
    () => ({
      eyebrow: `STAGE ${stageIndex + 1} OF ${STAGE_ORDER.length}`,
      title: stage.title,
      desc: stage.desc,
      placement: system.placement,
      learnMore: system.learnMore,
      action: stage.action,
      tone: stage.tone,
      removes: stage.removes,
      // the finished-water tone has no colour of its own; it takes the accent
      accent: SYSTEMS[currentSystem].accent,
    }),
    [stageIndex, stage, system.placement, system.learnMore, currentSystem],
  )

  return (
    <div className="app" data-system={currentSystem} ref={stageRef}>
      <main>
        <div className="stage-region">
          <SimCanvas
            currentSystem={currentSystem}
            currentStage={currentStage}
            focused={focused}
            paused={status === 'paused'}
            subscribe={walkthrough.subscribe}
            onPick={handleScenePick}
            rigRef={rigRef}
          />

          {/* above the sheet breakpoint it floats where it always has */}
          {!compact && <FactsCard facts={system.facts} />}
          <WhyCard />
          {/*
            The stage and the figures arrive when something has been picked and
            Reset view clears them: `focused` is false at the opening wide view,
            true the moment anything is picked from the sidebar or the scene,
            and false again on Reset view. Without that gate the Lab opens with
            cards already covering the diorama, describing a stage nobody has
            asked about yet.

            Both used to be drawn into the scene as textures beside the unit,
            where they came out grey, perspective-skewed and on top of the
            product. They are DOM cards now, in the same panel style as the
            facts and reasons, and always crisp.
          */}
          {focused && !compact && (
            <div className="card-column">
              <DetailCard {...cardContent} />
              <StatsCard figures={figures} />
            </div>
          )}
          {/*
            One panel on a phone, tabbed between the stage, the product, the
            figures and the company. Above the sheet breakpoint each has its
            own floating card, so there is nothing to tab through.
          */}
          {focused && compact && (
            <MobileSheet
              page={sheetPage}
              onPage={setSheetPage}
              content={cardContent}
              facts={system.facts}
              figures={figures}
              learnMore={system.learnMore}
            />
          )}
        </div>
      </main>

      {/*
        The interface, floating over the scene rather than framing it.

        One column, so the rail sits under the header at every width without a
        single offset being written down: the header is as tall as its copy
        makes it, and the row below simply follows. Nothing in here takes a
        pointer except the controls themselves — the rest is a hole through to
        the canvas, or two thirds of the orbit surface would be dead space.
      */}
      <div className="chrome">
        <Header title={system.title} subtitle={system.subtitle} />

        <div className="chrome-row">
          <Sidebar currentSystem={currentSystem} onSelectSystem={handleSelectSystem} />

          <div className="view-controls">
            <button className="chip-btn" onClick={handleResetView}>
              Reset view
            </button>
          </div>
        </div>
      </div>

      <PlayBar
        currentStage={currentStage}
        currentSystem={currentSystem}
        status={status}
        waterColours={SYSTEMS[currentSystem].colours}
        onTogglePlay={handleTogglePlay}
        onSelectStage={handleStageMarker}
        onScrub={walkthrough.seekFraction}
        onScrubStart={walkthrough.beginScrub}
        onScrubEnd={walkthrough.endScrub}
        subscribe={walkthrough.subscribe}
      />
    </div>
  )
}
