import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CursorGlow from './chrome/CursorGlow'
import MobileActions from './chrome/MobileActions'
import QuickQuote from './chrome/QuickQuote'
import ScrollRail from './chrome/ScrollRail'
import UtilityBar from './chrome/UtilityBar'
import { useBodyClass, useReveal } from './hooks'
import About from './sections/About'
import Areas from './sections/Areas'
import Benefits from './sections/Benefits'
import Compare from './sections/Compare'
import Decoder from './sections/Decoder'
import Difference from './sections/Difference'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'
import Finder from './sections/Finder'
import Guide from './sections/Guide'
import Hero from './sections/Hero'
import Installs from './sections/Installs'
import Reviews from './sections/Reviews'
import Services from './sections/Services'
import SiteFooter from './sections/SiteFooter'
import SiteHeader from './sections/SiteHeader'
import Specs from './sections/Specs'
import Steps from './sections/Steps'
import TrustStrip from './sections/TrustStrip'
import WaterLab from './sections/WaterLab'
import { SiteContext } from './SiteContext'
import ViewerModal from './ViewerModal'
import './styles/site.css'

/** The Lab's address: the hash that opens it, and the history entry it owns. */
const LAB_HASH = '#lab'

export default function Site() {
  /**
   * The Water Lab is mounted only while it is open, rather than hidden behind
   * the backdrop: the viewer is a live WebGL scene with a render loop, and one
   * running underneath a page nobody is looking at is a phone battery spent on
   * nothing. Closing it takes the scene down; opening it again rebuilds from
   * the already-downloaded chunk.
   */
  const [viewerOpen, setViewerOpen] = useState(() => window.location.hash === LAB_HASH)
  useBodyClass('menu-open', viewerOpen)

  /**
   * Opening the Lab is a page change, not a popup: it takes the whole screen
   * and gets its own history entry, so the browser's Back button (and a
   * phone's swipe-back) returns to the page exactly as the visitor left it,
   * and a link to `#lab` lands straight in the Lab. `pushed` remembers whether
   * this session put the entry there, so closing from inside the Lab can pop
   * it rather than pile up a second one — and a visitor who arrived on `#lab`
   * directly, with nowhere to go back to, just has the hash cleared instead.
   */
  const pushed = useRef(false)
  useEffect(() => {
    const onPop = () => setViewerOpen(window.location.hash === LAB_HASH)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /**
   * The two reading aids. Body classes, because what they change is spread
   * across the whole stylesheet rather than owned by any one section.
   */
  const [prefs, setPrefs] = useState({ easyRead: false, reducedMotion: false })
  const setPref = useCallback((key, on) => setPrefs((p) => ({ ...p, [key]: on })), [])
  useBodyClass('easy-read', prefs.easyRead)
  useBodyClass('reduced-motion', prefs.reducedMotion)

  /**
   * A section can send the visitor to the form with the first question
   * already answered. `key` ticks on every call so the form reacts even when
   * the same prefill is asked for twice in a row.
   */
  const [quotePrefill, setQuotePrefill] = useState(null)
  const openQuote = useCallback((prefill = {}) => {
    setQuotePrefill({ ...prefill, key: Date.now() })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const openViewer = useCallback(() => {
    if (window.location.hash !== LAB_HASH) {
      window.history.pushState(null, '', LAB_HASH)
      pushed.current = true
    }
    setViewerOpen(true)
  }, [])
  const closeViewer = useCallback(() => {
    if (pushed.current) {
      pushed.current = false
      window.history.back() // popstate closes it
      return
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setViewerOpen(false)
  }, [])
  const actions = useMemo(
    () => ({ openViewer, openQuote, quotePrefill, viewerOpen, prefs, setPref }),
    [openViewer, openQuote, quotePrefill, viewerOpen, prefs, setPref],
  )

  useReveal()

  return (
    <SiteContext.Provider value={actions}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <ScrollRail />
      <CursorGlow />

      <SiteHeader />

      <main id="main-content">
        <Hero />
        <TrustStrip />
        <WaterLab />
        <Decoder />
        <About />
        <Difference />
        <Services />
        <Finder />
        <Compare />
        <Specs />
        <Benefits />
        <Steps />
        <Reviews />
        <Installs />
        <Areas />
        <Guide />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />

      {viewerOpen && <ViewerModal onClose={closeViewer} />}

      <MobileActions />
      <UtilityBar />
      <QuickQuote />
    </SiteContext.Provider>
  )
}
