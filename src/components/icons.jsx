/** Inline SVGs. Stroke colour comes from CSS (currentColor) so theming is one place. */

const strokeProps = {
  width: 17,
  height: 17,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HouseIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9h14v-9" />
    </svg>
  )
}

export function TapIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M4 13a8 8 0 0116 0" />
      <path d="M12 13v7" />
      <path d="M9 20h6" />
    </svg>
  )
}

export function RainIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M7 15a5 5 0 010-10 6 6 0 0111.5 2A4.5 4.5 0 0117 15H7z" />
      <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg {...strokeProps} width={13} height={13}>
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

/** The droplet from the Pure Water Filtration mark. */
export function DropletLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.5c-3.2 4.3-6.5 8-6.5 12a6.5 6.5 0 0013 0c0-4-3.3-7.7-6.5-12zm0 15.3a3.3 3.3 0 110-6.6 3.3 3.3 0 010 6.6z" />
      <circle cx="12" cy="14.5" r="1.4" />
    </svg>
  )
}

export function PlayPauseIcon({ playing }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      {playing ? (
        <>
          <rect x="5" y="4" width="5" height="16" />
          <rect x="14" y="4" width="5" height="16" />
        </>
      ) : (
        <polygon points="6,4 20,12 6,20" />
      )}
    </svg>
  )
}
