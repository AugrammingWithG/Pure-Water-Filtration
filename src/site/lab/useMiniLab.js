import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_STAGE,
  DEFAULT_SYSTEM,
  STAGE_DWELL_MS,
  STAGE_ORDER,
} from '../../data/constants'
import { useWalkthrough } from '../../hooks/useWalkthrough'

/**
 * The Lab preview's brain: which system and stage are showing, whether the
 * camera has flown in to look at something, and the walkthrough that steps
 * the stages. The same rules as App.jsx, without the chrome — the section's
 * cards are the controls, and the scene is picked directly by clicking it,
 * so the two stay in step through this one piece of state.
 *
 * The camera is reached through `cameraRef`, a handle LabCanvas publishes
 * once it has mounted (see there); every call is optional-chained because
 * the controls exist before the canvas does (it loads on approach) and a
 * click on a card with no scene yet should simply set state for the scene
 * to pick up. Nothing here imports three: this runs in the page's own
 * bundle, and three.js only ever arrives on demand.
 */
export function useMiniLab() {
  const [currentSystem, setCurrentSystem] = useState(DEFAULT_SYSTEM)
  const [currentStage, setCurrentStage] = useState(DEFAULT_STAGE)
  /** False at the wide view; true once the camera has flown to something. */
  const [focused, setFocused] = useState(false)
  const cameraRef = useRef(null)

  const systemRef = useRef(currentSystem)
  useEffect(() => {
    systemRef.current = currentSystem
  }, [currentSystem])

  const selectStage = useCallback((systemKey, stageKey) => {
    setCurrentStage(stageKey)
    setFocused(true)
    cameraRef.current?.flyToStage(systemKey, stageKey)
  }, [])

  const walkthrough = useWalkthrough({
    stages: STAGE_ORDER.length,
    dwell: STAGE_DWELL_MS / 1000,
    onStage: (index) => selectStage(systemRef.current, STAGE_ORDER[index]),
  })
  const { status, play, pause, stop, seekStage } = walkthrough

  const pickStage = useCallback(
    (systemKey, stageKey) => {
      seekStage(STAGE_ORDER.indexOf(stageKey))
      selectStage(systemKey, stageKey)
    },
    [seekStage, selectStage],
  )

  const togglePlay = useCallback(() => {
    if (status === 'playing') {
      pause()
      return
    }
    if (status === 'idle') selectStage(systemRef.current, currentStage)
    play()
  }, [status, currentStage, selectStage, play, pause])

  const selectSystem = useCallback(
    (key) => {
      setCurrentSystem(key)
      stop()
      setFocused(true)
      cameraRef.current?.flyToSystem(key)
    },
    [stop],
  )

  /** A click in the scene: a whole unit (null stage) or one of its stages. */
  const scenePick = useCallback(
    (systemKey, stageKey) => {
      if (stageKey === null) {
        selectSystem(systemKey)
        return
      }
      setCurrentSystem(systemKey)
      pickStage(systemKey, stageKey)
    },
    [selectSystem, pickStage],
  )

  /** Back to the wide view; the duration is the rig's own unless given. */
  const reset = useCallback(
    (duration) => {
      stop()
      setFocused(false)
      cameraRef.current?.reset(duration)
    },
    [stop],
  )

  return {
    currentSystem,
    currentStage,
    focused,
    status,
    cameraRef,
    subscribe: walkthrough.subscribe,
    selectSystem,
    selectStageOf: (stageKey) => pickStage(systemRef.current, stageKey),
    togglePlay,
    pause,
    scenePick,
    reset,
  }
}
