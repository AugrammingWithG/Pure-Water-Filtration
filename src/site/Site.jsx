import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CursorGlow from './chrome/CursorGlow'
import MobileActions from './chrome/MobileActions'
import QuickQuote from './chrome/QuickQuote'
import ScrollProgress from './chrome/ScrollProgress'
import UtilityBar from './chrome/UtilityBar'
import { useBodyClass, useCardTilt, useReveal } from './hooks'
import About from './sections/About'
import Areas from './sections/Areas'
import Benefits from './sections/Benefits'
import Compare from './sections/Compare'
import Decoder from './sections/Decoder'
import Difference from './sections/Difference'
import Experience from './sections/Experience'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'
import Finder from './sections/Finder'
import Guide from './sections/Guide'
import Hero from './sections/Hero'
import Reviews from './sections/Reviews'
import Services from './sections/Services'
import SiteFooter from './sections/SiteFooter'
import SiteHeader from './sections/SiteHeader'
import Steps from './sections/Steps'
import TrustStrip from './sections/TrustStrip'
import WaterLab from './sections/WaterLab'
import { SiteContext } from './SiteContext'
import ViewerModal from './ViewerModal'
import './styles/site.css'

export default function Site() {
  /**
   * The Water Lab is mounted only while it is open, rather than hidden behind
   * the backdrop: the viewer is a live WebGL scene with a render loop, and one
   * running underneath a page nobody is looking at is a phone battery spent on
   * nothing. Closing it takes the scene down; opening it again rebuilds from
   * the already-downloaded chunk.
   */
  const [viewerOpen, setViewerOpen] = useState(false)
  useBodyClass('menu-open', viewerOpen)

  const [toast, setToast] = useState(false)
  const toastTimer = useRef(0)
  const showToast = useCallback(() => {
    setToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(false), 2800)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const openViewer = useCallback(() => setViewerOpen(true), [])
  const closeViewer = useCallback(() => setViewerOpen(false), [])
  const actions = useMemo(
    () => ({ openViewer, showToast, viewerOpen }),
    [openViewer, showToast, viewerOpen],
  )

  useReveal()
  useCardTilt()

  return (
    <SiteContext.Provider value={actions}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <ScrollProgress />
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
        <Experience />
        <Benefits />
        <Steps />
        <Reviews />
        <Areas />
        <Guide />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />

      {viewerOpen && <ViewerModal onClose={closeViewer} />}
      <div className={`toast${toast ? ' show' : ''}`} role="status">
        This is a design prototype — connect this button to the real download flow.
      </div>

      <MobileActions />
      <UtilityBar />
      <QuickQuote />
    </SiteContext.Provider>
  )
}

