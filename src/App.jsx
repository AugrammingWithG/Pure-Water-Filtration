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
import { focusRadiusFor, STAGE_POSITIONS } from './three/waterline'

/** Camera fly-to duration when a stage is selected. */
const FOCUS_DURATION = 850

export default function App() {
  const [currentSystem, setCurrentSystem] = useState(DEFAULT_SYSTEM)
  const [currentStage, setCurrentStage] = useState(DEFAULT_STAGE)
  const [isPlaying, setIsPlaying] = useState(false)

  /** Imperative handle on the camera rig, published by <Scene>. */
  const rigRef = useRef(null)

  /** Mirror of currentStage the autoplay interval can read without resubscribing. */
  const stageRef = useRef(currentStage)
  useEffect(() => {
    stageRef.current = currentStage
  }, [currentStage])

  const selectStage = useCallback((key, skipZoom) => {
    setCurrentStage(key)
    if (!skipZoom) {
      rigRef.current?.focus(STAGE_POSITIONS[key], focusRadiusFor(key), FOCUS_DURATION)
    }
  }, [])

  // Opening move: the prototype flew to the default stage on load. Child
  // effects run first, so the rig is already published by this point.
  useEffect(() => {
    rigRef.current?.focus(
      STAGE_POSITIONS[DEFAULT_STAGE],
      focusRadiusFor(DEFAULT_STAGE),
      FOCUS_DURATION,
    )
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const next =
        STAGE_ORDER[(STAGE_ORDER.indexOf(stageRef.current) + 1) % STAGE_ORDER.length]
      selectStage(next)
    }, AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isPlaying, selectStage])

  /** Picking a stage from the bottom bar stops the walkthrough. */
  const handleStageDot = useCallback(
    (key) => {
      setIsPlaying(false)
      selectStage(key)
    },
    [selectStage],
  )

  /**
   * Clicking a canister in the scene selects it but leaves autoplay running,
   * matching the prototype (only the UI controls stopped it).
   */
  const handleScenePick = useCallback(
    (key) => {
      selectStage(key)
    },
    [selectStage],
  )

  const handleResetView = useCallback(() => {
    setIsPlaying(false)
    rigRef.current?.reset()
  }, [])

  /** Switching systems swaps all copy and returns the camera to the wide view. */
  const handleSelectSystem = useCallback((key) => {
    setCurrentSystem(key)
    setIsPlaying(false)
    rigRef.current?.reset()
  }, [])

  const system = SYSTEM_DATA[currentSystem]
  const stage = STAGE_DATA_BY_SYSTEM[currentSystem][currentStage]
  const stageIndex = STAGE_ORDER.indexOf(currentStage)

  return (
    <div className="app">
      <Header title={system.title} subtitle={system.subtitle} />

      <main>
        <Sidebar currentSystem={currentSystem} onSelectSystem={handleSelectSystem} />

        <div className="stage-region">
          <SimCanvas
            currentStage={currentStage}
            onSelectStage={handleScenePick}
            rigRef={rigRef}
          />

          <div className="view-controls">
            <button className="chip-btn" onClick={handleResetView}>
              Reset view
            </button>
          </div>

          <CostCard
            before={system.before}
            after={system.after}
            savings={system.savings}
          />
          <TrendCard />
          <ImpactCard bottles={system.bottles} waste={system.waste} />
          <DetailCard
            eyebrow={`STAGE ${stageIndex + 1} OF ${STAGE_ORDER.length}`}
            title={stage.title}
            desc={stage.desc}
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
