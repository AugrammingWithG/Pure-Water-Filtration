/** Inline SVGs ported from the legacy markup. */

const strokeProps = (active) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: active ? '#3FD8FF' : '#8FADC4',
  strokeWidth: 1.8,
})

export function HouseIcon({ active }) {
  return (
    <svg {...strokeProps(active)}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9h14v-9" />
    </svg>
  )
}

export function TapIcon({ active }) {
  return (
    <svg {...strokeProps(active)}>
      <path d="M4 13a8 8 0 0116 0" />
      <path d="M12 13v7" />
      <path d="M9 20h6" />
    </svg>
  )
}

export function RainIcon({ active }) {
  return (
    <svg {...strokeProps(active)}>
      <path d="M7 15a5 5 0 010-10 6 6 0 0111.5 2A4.5 4.5 0 0117 15H7z" />
      <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
    </svg>
  )
}

export function PlayPauseIcon({ playing }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#04121F">
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
