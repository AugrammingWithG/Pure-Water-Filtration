import * as THREE from 'three'

/**
 * Shared canvas drawing for the cards that live in the scene.
 *
 * Both the stage card and the stat cards are laid out in CSS pixels — the same
 * numbers their DOM counterparts use in index.css — and then rendered at
 * PIXEL_SCALE times that size. Because a scene card holds a steady size on
 * screen (see billboard.js), its largest on-screen width is known in advance,
 * so drawing well above it keeps the text oversampled at every zoom rather
 * than softening as the camera comes in.
 */

export const PIXEL_SCALE = 4
export const PAD_X = 18
export const PAD_Y = 16
export const CARD_RADIUS = 14

/**
 * Palette, matching the light theme in index.css.
 *
 * The panel is the DOM cards' own — "At a glance" and "Why Pure Water
 * Filtration" — to the number: the same 0.74, the same hairline border. Every
 * card on screen is made of the same stuff whether the browser or the
 * renderer drew it.
 *
 * They will not look identical, and no alpha here can make them. A DOM card
 * pairs that 0.74 with a backdrop blur, which flattens whatever is behind it
 * to an even tone before the white goes over; a canvas texture has no
 * backdrop to blur, only whatever the renderer already drew behind the quad,
 * so the diorama comes through these sharp. Same alpha, busier result. The
 * honest fix is a transmission material, not a bigger number.
 *
 * Shared by both canvas cards: the stage card draws its own layout but takes
 * these two from here, because a stage card and a stat card sitting side by
 * side in the same scene at different opacities reads as a mistake, and two
 * copies of the number is how that happens.
 */
export const PANEL = 'rgba(255,255,255,0.74)'
export const BORDER = 'rgba(15,28,51,0.07)'
export const INK = '#0F1C33'
export const INK_DIM = '#5D6C85'
export const LINE = 'rgba(15,28,51,0.14)'
export const AMBER = '#D9832E'
export const MINT = '#1F9E6A'

export const FONT_UI = 'Inter, system-ui, sans-serif'
export const FONT_DISPLAY = '"Space Grotesk", Inter, system-ui, sans-serif'

/** en-AU rather than the host locale: the copy is Australian throughout. */
const NUMBER = new Intl.NumberFormat('en-AU')

/**
 * A figure with its prefix and unit. Lives here rather than in data/ because
 * it is presentation: how a card writes a number, not what the number is.
 */
export function formatFigure(n, { prefix = '', unit = '' } = {}) {
  return prefix + NUMBER.format(Math.round(n)) + (unit ? ' ' + unit : '')
}

export function rgba(colour, alpha) {
  const c = new THREE.Color(colour)
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`
}

export function hex(colour) {
  return '#' + new THREE.Color(colour).getHexString()
}

/**
 * Darken a colour until it reads against a white panel. Several of the scene
 * tones are deliberately pale — dissolved solids and minerals are nearly white
 * in the water — and a pale dot on a pale chip is invisible. Derived rather
 * than hand-picked so a chip can never drift from the particle it stands for.
 */
export function readable(colour) {
  const c = new THREE.Color(colour)
  const luminance = () => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  let guard = 12
  while (luminance() > 0.45 && guard-- > 0) c.multiplyScalar(0.86)
  return '#' + c.getHexString()
}

/** Greedy word wrap. Returns the lines that fit inside `max`. */
export function wrap(ctx, text, max) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? line + ' ' + word : word
    if (line && ctx.measureText(next).width > max) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** A context with no canvas behind it, for the measuring pass. */
export function measureContext() {
  return document.createElement('canvas').getContext('2d')
}

/**
 * A canvas at `width` x `height` CSS pixels, scaled up for sharpness, with the
 * card panel already drawn on it. Returns the context to draw the contents in,
 * in CSS pixel coordinates.
 */
export function cardCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width * PIXEL_SCALE
  canvas.height = height * PIXEL_SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(PIXEL_SCALE, PIXEL_SCALE)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = PANEL
  roundRect(ctx, 0.5, 0.5, width - 1, height - 1, CARD_RADIUS)
  ctx.fill()
  ctx.strokeStyle = BORDER
  ctx.lineWidth = 1
  ctx.stroke()

  return { canvas, ctx }
}

export function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/** The small uppercase heading every card carries. */
export function drawLabel(ctx, text, y) {
  ctx.font = `700 10px ${FONT_UI}`
  try {
    ctx.letterSpacing = '0.7px'
  } catch {
    // letterSpacing is not in every engine; the card reads fine without it
  }
  ctx.fillStyle = INK_DIM
  ctx.fillText(String(text).toUpperCase(), PAD_X, y + 8)
  try {
    ctx.letterSpacing = '0px'
  } catch {
    // no-op
  }
  return y + 20
}
