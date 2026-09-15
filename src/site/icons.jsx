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
      <path d="M5 12.5l4.5 4.5L19 7.5" />
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
