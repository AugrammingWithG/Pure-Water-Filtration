import { dotLabelFor, STAGE_ORDER } from '../data/constants'
import { PlayPauseIcon } from './icons'

export default function PlayBar({
  currentStage,
  currentSystem,
  isPlaying,
  onTogglePlay,
  onSelectStage,
}) {
  const index = STAGE_ORDER.indexOf(currentStage)
  const progress = ((index + 1) / STAGE_ORDER.length) * 100

  return (
    <div className="playbar-wrap">
      <div className="playbar">
        <button
          className="play-btn"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
        >
          <PlayPauseIcon playing={isPlaying} />
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="stage-count">
          Stage {index + 1} of {STAGE_ORDER.length} stages
        </span>
      </div>

      <div className="stage-dots">
        {STAGE_ORDER.map((key) => (
          <button
            key={key}
            className={`stage-dot-btn${key === currentStage ? ' active' : ''}`}
            onClick={() => onSelectStage(key)}
          >
            <span className="dotmark" />
            <span>{dotLabelFor(key, currentSystem)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
