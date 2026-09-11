import { useCallback, useEffect, useRef, useState } from 'react'
import CostCard from './components/CostCard'
import DetailCard from './components/DetailCard'
import Header from './components/Header'
import ImpactCard from './components/ImpactCard'
import PlayBar from './components/PlayBar'
import Sidebar from './components/Sidebar'
import SimCanvas from './components/SimCanvas'
import TrendCard from './components/TrendCard'
import {
  AUTOPLAY_INTERVAL_MS,
  DEFAULT_STAGE,
  DEFAULT_SYSTEM,
  STAGE_DATA_BY_SYSTEM,
  STAGE_ORDER,
  SYSTEM_DATA,
} from './data/constants'
import { stageView, SYSTEMS } from './three/systems'

/** Camera fly-to duration for a stage; a little longer when changing system. */
const STAGE_FLY_MS = 850
const SYSTEM_FLY_MS = 1100

export default function App() {
  const [currentSystem, setCurrentSystem] = useState(DEFAULT_SYSTEM)
  const [currentStage, setCurrentStage] = useState(DEFAULT_STAGE)
  const [isPlaying, setIsPlaying] = useState(false)
  /**
   * False at the wide opening view, true once the camera has flown to a
   * product or stage. Drives the x-ray covers and the house cutaway, so the
   * diorama stays intact until the user asks to look inside something.
   */
  const [focused, setFocused] = useState(false)

  /** Imperative handle on the camera rig, published by <Scene>. */
  const rigRef = useRef(null)

  /** Mirrors the autoplay interval can read without resubscribing. */
  const systemRef = useRef(currentSystem)
  const stageRef = useRef(currentStage)
  useEffect(() => {
    systemRef.current = currentSystem
    stageRef.current = currentStage
  }, [currentSystem, currentStage])

  const selectStage = useCallback((systemKey, stageKey) => {
    setCurrentStage(stageKey)
    setFocused(true)
    rigRef.current?.flyTo(stageView(systemKey, stageKey), STAGE_FLY_MS)
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const next =
        STAGE_ORDER[(STAGE_ORDER.indexOf(stageRef.current) + 1) % STAGE_ORDER.length]
      selectStage(systemRef.current, next)
    }, AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isPlaying, selectStage])

  /** Picking a stage from the bottom bar stops the walkthrough. */
  const handleStageDot = useCallback(
    (key) => {
      setIsPlaying(false)
      selectStage(systemRef.current, key)
    },
    [selectStage],
  )

  /**
   * Sidebar: switch system and fly the camera to that product. Clicking the
   * system that is already active still flies there, so it doubles as a
   * "take me to it" button after the user has orbited away.
   */
  const handleSelectSystem = useCallback((key) => {
    setCurrentSystem(key)
    setIsPlaying(false)
    setFocused(true)
    rigRef.current?.flyTo(SYSTEMS[key].view, SYSTEM_FLY_MS)
  }, [])

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
      selectStage(systemKey, stageKey)
    },
    [handleSelectSystem, selectStage],
  )

  const handleResetView = useCallback(() => {
    setIsPlaying(false)
    setFocused(false)
    rigRef.current?.reset()
  }, [])

  const system = SYSTEM_DATA[currentSystem]
  const stage = STAGE_DATA_BY_SYSTEM[currentSystem][currentStage]
  const stageIndex = STAGE_ORDER.indexOf(currentStage)

  return (
    <div className="app" data-system={currentSystem}>
      <Header title={system.title} subtitle={system.subtitle} />

      <main>
        <Sidebar currentSystem={currentSystem} onSelectSystem={handleSelectSystem} />

        <div className="stage-region">
          <SimCanvas
            currentSystem={currentSystem}
            currentStage={currentStage}
            focused={focused}
            onPick={handleScenePick}
            rigRef={rigRef}
          />

          <div className="view-controls">
            <button className="chip-btn" onClick={handleResetView}>
              Reset view
            </button>
          </div>

          <CostCard before={system.before} after={system.after} savings={system.savings} />
          <TrendCard />
          <ImpactCard bottles={system.bottles} waste={system.waste} />
          <DetailCard
            eyebrow={`STAGE ${stageIndex + 1} OF ${STAGE_ORDER.length}`}
            title={stage.title}
            desc={stage.desc}
            placement={system.placement}
          />
        </div>
      </main>

      <PlayBar
        currentStage={currentStage}
        currentSystem={currentSystem}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSelectStage={handleStageDot}
      />
    </div>
  )
}
