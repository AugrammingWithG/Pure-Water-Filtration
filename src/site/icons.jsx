/**
 * The page's icon set: one stroke weight, one grid, currentColor throughout,
 * so an icon takes the colour of whatever it sits in. Drawn here rather than
 * typed as glyphs (★ ⌂ ✓) because a glyph is whatever the visitor's font
 * happens to make of it.
 */

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const sized = (size) => ({ ...stroke, width: size, height: size })

export function ArrowIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** The arrow that leaves the page: the Water Lab, the client's site. */
export function OpenIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

export function DownloadIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M12 4v11M7 10l5 5 5-5M5 19h14" />
    </svg>
  )
}

export function CheckIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} strokeWidth={2.2}>
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
    </svg>
  )
}

export function PhoneIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M6.5 3h3l1.6 4-2 1.3a11 11 0 006.6 6.6l1.3-2 4 1.6v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.2 2 2 0 016.5 3z" />
    </svg>
  )
}

export function MailIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

export function StarIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} fill="currentColor" stroke="none">
      <path d="M12 2.8l2.7 5.9 6.4.7-4.8 4.4 1.3 6.3L12 17l-5.6 3.1 1.3-6.3-4.8-4.4 6.4-.7z" />
    </svg>
  )
}

export function PinIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

export function ShieldIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" />
      <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
    </svg>
  )
}

export function HomeIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M3.5 11l8.5-7 8.5 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function DropIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 3.5s6 6.6 6 11a6 6 0 01-12 0c0-4.4 6-11 6-11z" />
    </svg>
  )
}

export function PlayIcon({ size = 14 }) {
  return (
    <svg {...sized(size)} fill="currentColor" stroke="none">
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  )
}

export function MenuIcon({ size = 22 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon({ size = 20 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function PlusIcon({ size = 18 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TextSizeIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M4 18l4.5-12h1L14 18M6 14h6" />
      <path d="M15.5 18l2.3-6h.8l2.4 6M16.5 15.5h3.4" />
    </svg>
  )
}

export function MotionIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M4 12h3l2-5 3 10 2-6 1.5 1H20" />
    </svg>
  )
}

/* ------------------------------------------------------------------
   The sections' own icons: what is in the water, where it goes, and
   what the company promises. Same grid, same stroke, so a row of them
   reads as one set beside the ones above. Where a path carries
   pathLength="1" the stylesheet can draw it (dashoffset 1 → 0).
   ------------------------------------------------------------------ */

/** A kitchen tap, side on. */
export function TapIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M4 9.5h8.5a4.5 4.5 0 014.5 4.5v1.5" />
      <path d="M8.5 9.5V6.5M5.5 6.5h6" />
      <path d="M15 15.5h4v3h-4z" />
      <path d="M17 21v.5" />
    </svg>
  )
}

export function ShowerIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M6 12h12" />
      <path d="M9 12V9a3 3 0 013-3h3.5V4" />
      <path d="M8 16v1M12 16v1M16 16v1M10 20v1M14 20v1" />
    </svg>
  )
}

/** A glass with water in it. */
export function GlassIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M6 4h12l-1.4 14.5a2 2 0 01-2 1.8H9.4a2 2 0 01-2-1.8z" />
      <path d="M7.2 12h9.6" />
    </svg>
  )
}

/** A kettle: where scale shows up first. */
export function KettleIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M6.5 10.5h11l-1.2 8.5H7.7z" />
      <path d="M9 10.5V9a3 3 0 016 0v1.5" />
      <path d="M17.5 12.5H19a1 1 0 011 1V15a1 1 0 01-1 1h-1.6" />
      <path d="M12 6V4.5" />
      <path d="M5 21h14" />
    </svg>
  )
}

/** A rainwater tank with its outlet. */
export function TankIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <rect x="4.5" y="4.5" width="15" height="14" rx="2" />
      <path d="M4.5 9.5h15" />
      <path d="M9 18.5v2.5M15 18.5v2.5" />
      <path d="M19.5 14h2" />
    </svg>
  )
}

export function FlaskIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M9 3h6" />
      <path d="M10 3v5.5l-5.2 8.8A2 2 0 006.5 20h11a2 2 0 001.7-2.7L14 8.5V3" />
      <path d="M7.5 15h9" />
    </svg>
  )
}

/** Grit: the specks a sediment stage catches. */
export function GritIcon({ size = 16 }) {
  return (
    <svg {...sized(size)} fill="currentColor" stroke="none">
      <circle cx="7" cy="8" r="1.4" />
      <circle cx="12" cy="5.5" r="1.2" />
      <circle cx="17" cy="9" r="1.6" />
      <circle cx="9" cy="13.5" r="1.1" />
      <circle cx="15" cy="14.5" r="1.4" />
      <circle cx="12" cy="18.5" r="1.6" />
      <circle cx="6" cy="17.5" r="1.2" />
      <circle cx="18.5" cy="18" r="1" />
    </svg>
  )
}

/** A mineral crystal. */
export function MineralIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M8 3h8l4.5 6.5L12 21 3.5 9.5z" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3l4 6.5L16 3" />
      <path d="M12 9.5V21" />
    </svg>
  )
}

export function FunnelIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M4 5h16l-6 7.5V18l-4 2.5V12.5z" />
    </svg>
  )
}

export function SparkleIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="M12 7.5l1.6 2.9 2.9 1.6-2.9 1.6L12 16.5l-1.6-2.9L7.5 12l2.9-1.6z" />
    </svg>
  )
}

/** Water coming in: an arrow into a pipe. */
export function InletIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M3 12h8M8 9l3 3-3 3" />
      <path d="M14 5h2a4 4 0 014 4v6a4 4 0 01-4 4h-2z" />
    </svg>
  )
}

export function RainIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M7 15a4 4 0 01-.6-7.95A5.5 5.5 0 0117 8.5 3.25 3.25 0 0117 15H7z" />
      <path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5" />
    </svg>
  )
}

export function BuildingIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M5 21V5a2 2 0 012-2h7a2 2 0 012 2v16" />
      <path d="M16 9h2a2 2 0 012 2v10" />
      <path d="M3 21h18" />
      <path d="M9 7h2M9 11h2M9 15h2M12.5 7h1M12.5 11h1M12.5 15h1" />
    </svg>
  )
}

export function CompassIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5.5-5 2 2-5.5z" />
    </svg>
  )
}

export function FamilyIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 20v-1.5a5.5 5.5 0 0111 0V20" />
      <path d="M14.5 20v-1.5a3.5 3.5 0 016-2.4" />
    </svg>
  )
}

export function CheckCircleIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.4 2.4 4.6-5" pathLength="1" />
    </svg>
  )
}

export function DotsIcon({ size = 16 }) {
  return (
    <svg {...sized(size)} fill="currentColor" stroke="none">
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  )
}

export function ClockIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function PercentIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M6.5 17.5l11-11" />
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
    </svg>
  )
}

export function TruckIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h3.5l3.5 3.5V16h-7" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17.5" cy="17.5" r="1.6" />
    </svg>
  )
}

export function InfinityIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 12c-1.4-2.4-2.7-4-5-4a4 4 0 000 8c2.3 0 3.6-1.6 5-4s2.7-4 5-4a4 4 0 010 8c-2.3 0-3.6-1.6-5-4z" />
    </svg>
  )
}

export function ChatIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M5 4h14a2 2 0 012 2v8a2 2 0 01-2 2H9.5L5 20v-4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  )
}

export function ClipboardIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M9 3.5h6v3H9z" />
      <path d="M7 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

export function QuoteIcon({ size = 16 }) {
  return (
    <svg {...sized(size)} fill="currentColor" stroke="none">
      <path d="M6 7h4.5v4.5c0 3.1-1.4 5-4.5 5.7v-2.1c1.3-.4 2-1.3 2-2.6H6z" />
      <path d="M13.5 7H18v4.5c0 3.1-1.4 5-4.5 5.7v-2.1c1.3-.4 2-1.3 2-2.6h-2z" />
    </svg>
  )
}

export function VerifiedIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 2.8l2.3 1.7 2.8-.3 1.1 2.6 2.5 1.4-.6 2.8.6 2.8-2.5 1.4-1.1 2.6-2.8-.3L12 21.2l-2.3-1.7-2.8.3-1.1-2.6-2.5-1.4.6-2.8-.6-2.8 2.5-1.4 1.1-2.6 2.8.3z" />
      <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
    </svg>
  )
}

export function CertificateIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M4 4h16v11H4z" />
      <path d="M8 8h8M8 11h5" />
      <path d="M9 15v6l3-2 3 2v-6" />
    </svg>
  )
}

export function WrenchIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M20.3 6.7a5 5 0 01-6.4 6.4L7.5 19.5a2 2 0 01-3-3l6.4-6.4a5 5 0 016.4-6.4l-3 3 .8 2.2 2.2.8z" />
    </svg>
  )
}

export function TagIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M3.5 12.5V4a.5.5 0 01.5-.5h8.5l8 8-9 9z" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Three layers: the sediment cartridge is literally three-layer. */
export function LayersIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 4l8.5 4.5L12 13 3.5 8.5z" />
      <path d="M3.5 12.5L12 17l8.5-4.5" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </svg>
  )
}

/** A carbon hexagon. */
export function HexIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
      <path d="M12 8l3.5 2v4L12 16l-3.5-2v-4z" />
    </svg>
  )
}

export function CalendarIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10.5h16M8 3.5v4M16 3.5v4" />
      <path d="M8 14h2M12 14h2" />
    </svg>
  )
}

export function DashIcon({ size = 16 }) {
  return (
    <svg {...sized(size)} strokeWidth={2}>
      <path d="M6 12h12" pathLength="1" />
    </svg>
  )
}

export function HelpIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.6a2.5 2.5 0 015 0c0 1.8-2.5 2-2.5 3.6" />
      <path d="M12 16.8v.2" strokeWidth={2.4} />
    </svg>
  )
}

export function MapIcon({ size = 16 }) {
  return (
    <svg {...sized(size)}>
      <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </svg>
  )
}
