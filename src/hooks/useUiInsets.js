import { useEffect, useState } from 'react'

/**
 * How much of the canvas the interface is standing on, per edge, as a
 * fraction of the canvas.
 *
 * The scene cards keep themselves inside the frame, which is not the same as
 * keeping themselves visible: the floating cards sit in a column down one
 * side and the play bar across the foot, so the corner of the frame a card
 * slides into to stay on screen is often the one place on screen it cannot be
 * read. Handing the scene the real measurements is what closes that gap.
 *
 * Measured from the elements themselves rather than declared as constants,
 * because the same numbers are already written in the stylesheet and in six
 * media queries, and a second copy here would be wrong within a release. It
 * also means a card that is hidden at some width simply stops counting.
 *
 * Returns one object, mutated in place rather than replaced: this is read
 * inside the frame loop, and an inset changing is not a reason to re-render
 * the scene. Held in state purely for a stable identity — it is never set, so
 * it never triggers a render, and it can sit in a dependency array without
 * churning one.
 */

/**
 * The fixed interface: the pieces that are always somewhere, whose size the
 * stylesheet can be told about. Their measurements go out as CSS variables so
 * the floating cards can be placed against the real header and the real play
 * bar rather than against a guess at them.
 */
const CHROME = 'header, .sidebar, .view-controls, .playbar'
/**
 * Everything a scene card has to keep out from under: the chrome, plus the
 * floating cards themselves.
 *
 * Deliberately not the same list. The floating cards are positioned *by* the
 * variables above, so measuring them into those variables would be a loop —
 * the card moves, the inset grows, the card moves again. They belong only in
 * the answer handed to the scene, which nothing in the DOM reads back.
 */
const OVERLAYS = CHROME + ', .float-card'

/** Ignore an overlay that would swallow more than this much of an axis. */
const MAX_INSET = 0.4

export function useUiInsets(containerRef) {
  const [insets] = useState(() => ({ top: 0, right: 0, bottom: 0, left: 0 }))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    /** How far the matching elements reach in from each edge, as fractions. */
    const reachOf = (box, selector) => {
      const next = { top: 0, right: 0, bottom: 0, left: 0 }
      for (const node of el.querySelectorAll(selector)) {
        const r = node.getBoundingClientRect()
        if (!r.width || !r.height) continue
        /*
          How far into the canvas this element reaches from each edge. It is
          charged to whichever edge it is nearest — measured as a share of
          that axis, so a wide-but-short bar at the foot is charged to the
          bottom and a tall-but-narrow card at the side is charged to the
          side, rather than both being charged to whichever happens to be
          fewer pixels away.
        */
        const reach = {
          left: (r.right - box.left) / box.width,
          right: (box.right - r.left) / box.width,
          top: (r.bottom - box.top) / box.height,
          bottom: (box.bottom - r.top) / box.height,
        }
        const edge = Object.keys(reach).reduce((a, b) => (reach[a] <= reach[b] ? a : b))
        // A card mid-canvas is not an edge at all; leaving it out is right,
        // since walling off half the frame would do more harm than the overlap.
        if (reach[edge] <= MAX_INSET) next[edge] = Math.max(next[edge], reach[edge])
      }

      return next
    }

    const measure = () => {
      const box = el.getBoundingClientRect()
      if (!box.width || !box.height) return

      /*
        The chrome goes out as CSS variables, so the floating cards can be
        placed against the real header and the real play bar instead of
        against a guess at them.
      */
      const chrome = reachOf(box, CHROME)
      const px = (v, of) => Math.round(v * of) + 'px'
      el.style.setProperty('--ui-top', px(chrome.top, box.height))
      el.style.setProperty('--ui-right', px(chrome.right, box.width))
      el.style.setProperty('--ui-bottom', px(chrome.bottom, box.height))
      el.style.setProperty('--ui-left', px(chrome.left, box.width))

      Object.assign(insets, reachOf(box, OVERLAYS))
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    // cards mount and unmount on a pick, and move between breakpoints
    const mutate = new MutationObserver(measure)
    mutate.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
    return () => {
      resize.disconnect()
      mutate.disconnect()
    }
  }, [containerRef, insets])

  return insets
}
