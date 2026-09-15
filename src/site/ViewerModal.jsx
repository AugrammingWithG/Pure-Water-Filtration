import { lazy, Suspense, useEffect, useRef } from 'react'

/**
 * The 3D viewer — the whole of the original app — loaded only when someone
 * actually asks for the Water Lab. It is by far the heaviest thing on the
 * page (three.js, the diorama, its textures), and a visitor who reads the page
 * and calls for a quote should never pay for it.
 */
const ViewerApp = lazy(() => import('../App.jsx'))

/** The concept's pipes-and-canisters animation, now doing an honest job. */
function ViewerLoading() {
  return (
    <div className="viewer-loading">
      <div className="modal-title">
        <small>PUREWATER FILTRATION</small>
        <h3>The Water Lab</h3>
      </div>
      <div className="filter-machine" aria-hidden="true">
        <div className="pipe top" />
        <div className="pipe left" />
        <div className="pipe right" />
        <div className="flow f1" />
        <div className="flow f2" />
        <div className="flow f3" />
        <div className="canister" />
        <div className="canister" />
        <div className="canister" />
        <div className="canister" />
      </div>
      <div className="modal-hint">Priming the Water Lab…</div>
    </div>
  )
}

export default function ViewerModal({ onClose }) {
  const closeRef = useRef(null)

  /**
   * Escape closes, and the button that opened the modal gets the focus back
   * when it does. The viewer has its own keyboard transport on the window
   * (space, arrows) and no use for Escape, so the two do not collide.
   */
  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [onClose])

  return (
    <div
      className="viewer-modal open"
      role="dialog"
      aria-modal="true"
      aria-label="The Water Lab — interactive 3D filtration viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-inner">
        <button className="modal-close" onClick={onClose} aria-label="Close" ref={closeRef}>
          ×
        </button>
        {/*
          The viewer sizes itself to whatever hosts it, so the frame decides how
          big the Water Lab is and the app inside simply fills it.
        */}
        <div className="viewer-host">
          <Suspense fallback={<ViewerLoading />}>
            <ViewerApp />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
