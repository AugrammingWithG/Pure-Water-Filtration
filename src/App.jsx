import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DetailCard from './components/DetailCard'
import MobileSheet from './components/MobileSheet'
import FactsCard from './components/FactsCard'
import Header from './components/Header'
import PlayBar from './components/PlayBar'
import Sidebar from './components/Sidebar'
import SimCanvas from './components/SimCanvas'
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

const money = (n) => '$' + Math.round(n).toLocaleString('en-AU')

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


  /**
   * Where the stage card is drawn. In the scene on a large viewport, where
   * there is room beside the product for it; as a DOM card on a small one,
   * where a world-anchored card has nowhere to go and would be too small to
   * read whatever resolution it was drawn at.
   */
  const sceneCard = useMediaQuery('(min-width: 761px)')
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
   * The canvas and everything floating over it. Measured so the scene cards
   * can keep out from under the floating cards and the play bar, which they
   * would otherwise slide beneath whenever they ran out of frame.
   */
  const stageRef = useRef(null)
  const insets = useUiInsets(stageRef)

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

  const handleStageMarker = useCallback(
    (key) => pickStage(systemRef.current, key),
    [pickStage],
  )

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

  /** Placeholder figures for the three scene cards. See MVP_FIGURES. */
  const figures = MVP_FIGURES[currentSystem]

  /** One description of the current stage, whichever card ends up drawing it. */
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
    <div className="app" data-system={currentSystem}>
      <Header title={system.title} subtitle={system.subtitle} />

      <main>
        <Sidebar currentSystem={currentSystem} onSelectSystem={handleSelectSystem} />

        <div className="stage-region" ref={stageRef}>
          <SimCanvas
            currentSystem={currentSystem}
            currentStage={currentStage}
            focused={focused}
            paused={status === 'paused'}
            subscribe={walkthrough.subscribe}
            cardContent={cardContent}
            showCard={sceneCard}
            figures={figures}
            /*
              The scene card breakpoint as before, plus the phone, which now
              has a card design narrow enough to read and a place to put three
              of them. The band between the two is still left out: there the
              detail card is a floating DOM one and the row would be competing
              with it for the same corner.
            */
            showStats={focused && (sceneCard || compact)}
            insets={insets}
            compact={compact}
            /*
             * All four cards travel together: the stage card explaining the
             * step, and the three system cards beside it. `focused` is already
             * exactly the right signal — false at the opening wide view, true
             * the moment anything is picked from the sidebar or the scene, and
             * false again on Reset view. Keying off it rather than off what
             * kind of thing was picked also means it does not matter which
             * mesh the raycast happened to land on: cover, cartridge or badge,
             * you are looking at that system either way.
             */
            onPick={handleScenePick}
            rigRef={rigRef}
          />

          <div className="view-controls">
            <button className="chip-btn" onClick={handleResetView}>
              Reset view
            </button>
          </div>

          {/* above the sheet breakpoint it floats where it always has */}
          {!compact && <FactsCard facts={system.facts} />}
          <WhyCard />
          {/*
            The three scene cards are canvas, and canvas text is invisible to a
            screen reader. This is the same content as a sentence, so the
            figures are not lost to one.
          */}
          <p className="sr-only">
            Estimated for this system: {money(figures.before)} a year now,{' '}
            {money(figures.after)} filtered, saving {money(figures.before - figures.after)} a
            year. Over five years, {money(figures.before * 5)} against{' '}
            {money(figures.after * 5)}. This year:{' '}
            {figures.litres.toLocaleString('en-AU')} litres filtered,{' '}
            {figures.bottles.toLocaleString('en-AU')} bottles avoided, and {figures.waste} kg
            of plastic waste diverted.
          </p>
          {/* On a large viewport the card lives in the scene instead; only
              one of the two may exist at a time. */}
          {/*
            Same rule as the scene cards: it arrives when something has been
            picked and Reset view clears it. Without the `focused` gate the
            phone opens with the sheet already covering half the diorama,
            describing a stage nobody has asked about yet.
          */}
          {/*
            One panel on a phone, tabbed between the stage, the product and the
            company. Above the sheet breakpoint the figures and the reasons have
            their own floating cards, so there is nothing to tab through and the
            card just floats as it always has.
          */}
          {focused && compact && (
            <MobileSheet
              page={sheetPage}
              onPage={setSheetPage}
              content={cardContent}
              facts={system.facts}
              learnMore={system.learnMore}
            />
          )}
          {focused && !compact && !sceneCard && <DetailCard {...cardContent} />}
        </div>
      </main>

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
