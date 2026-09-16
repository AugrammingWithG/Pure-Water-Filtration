import { MotionIcon, TextSizeIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * Two reading aids, kept deliberately blunt: larger text, and motion turned
 * down. Desktop only; on a phone the same two toggles live in the menu, where
 * a floating pill would have sat on top of the content it was meant to help
 * with.
 */
export default function UtilityBar() {
  const { prefs, setPref } = useSite()
  return (
    <div className="utility-bar" aria-label="Reading options">
      <button
        className={prefs.easyRead ? 'on' : ''}
        onClick={() => setPref('easyRead', !prefs.easyRead)}
        aria-label="Larger text"
        aria-pressed={prefs.easyRead}
        title="Larger text"
      >
        <TextSizeIcon />
      </button>
      <button
        className={prefs.reducedMotion ? 'on' : ''}
        onClick={() => setPref('reducedMotion', !prefs.reducedMotion)}
        aria-label="Reduce motion"
        aria-pressed={prefs.reducedMotion}
        title="Reduce motion"
      >
        <MotionIcon />
      </button>
    </div>
  )
}
