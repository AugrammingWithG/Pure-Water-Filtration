import * as THREE from 'three'

/**
 * Draws the stage card to a canvas, for use as a texture on a plane in the
 * scene.
 *
 * The card is laid out in CSS pixels — the same numbers as `.card-detail` in
 * index.css, so the scene card and the mobile DOM card stay recognisably the
 * same object — and then rendered at PIXEL_SCALE times that size. Because the
 * card holds a steady size on screen (see parts/billboard.js), its largest
 * on-screen width is known in advance, so drawing well above it keeps the text
 * oversampled at every zoom instead of softening as the camera comes in.
 *
 * Height is measured from the content rather than fixed: the body copy wraps
 * to a different number of lines per stage, and a fixed height would leave a
 * ragged gap under the short ones.
 */

const WIDTH = 236
const PIXEL_SCALE = 4
const PAD_X = 18
const PAD_Y = 16
const RADIUS = 14

/** Palette, matching the light theme in index.css. */
const PANEL = 'rgba(255,255,255,0.93)'
const BORDER = 'rgba(15,28,51,0.14)'
const INK = '#0F1C33'
const INK_DIM = '#5D6C85'
const LINE = 'rgba(15,28,51,0.14)'

const FONT_UI = 'Inter, system-ui, sans-serif'
const FONT_DISPLAY = '"Space Grotesk", Inter, system-ui, sans-serif'

/** Panel is drawn more opaque than the DOM card: it sits over the diorama
 *  rather than over a soft page background, and has to stay readable there. */

function rgba(hex, alpha) {
  const c = new THREE.Color(hex)
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`
}

function hex(colour) {
  return '#' + new THREE.Color(colour).getHexString()
}

/** Greedy word wrap. Returns the lines that fit inside `max`. */
function wrap(ctx, text, max) {
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

/** A small map pin, drawn rather than loaded so the card stays one canvas. */
function pin(ctx, x, y, size, colour) {
  ctx.fillStyle = colour
  ctx.beginPath()
  ctx.arc(x, y - size * 0.25, size * 0.34, Math.PI, 0)
  ctx.lineTo(x, y + size * 0.45)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y - size * 0.25, size * 0.14, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fill()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const BUTTONS = ['Overview', 'How it works', 'Specs']

/**
 * Lays the card out, and draws it if a context is given. Split in two passes
 * over the same code so the canvas can be created at exactly the height the
 * content needs.
 */
function layout(ctx, { eyebrow, title, desc, placement, accent }, draw) {
  const inner = WIDTH - PAD_X * 2
  const accentHex = hex(accent)
  let y = PAD_Y

  // ---- eyebrow ----
  ctx.font = `700 10px ${FONT_UI}`
  try {
    ctx.letterSpacing = '0.6px'
  } catch {
    // letterSpacing is not in every engine; the card reads fine without it
  }
  if (draw) {
    ctx.fillStyle = accentHex
    ctx.fillText(String(eyebrow).toUpperCase(), PAD_X, y + 8)
  }
  try {
    ctx.letterSpacing = '0px'
  } catch {
    // no-op
  }
  y += 14

  // ---- title ----
  ctx.font = `600 16px ${FONT_DISPLAY}`
  const titleLines = wrap(ctx, title, inner)
  for (const line of titleLines) {
    if (draw) {
      ctx.fillStyle = INK
      ctx.fillText(line, PAD_X, y + 13)
    }
    y += 20
  }
  y += 4

  // ---- body ----
  ctx.font = `400 12px ${FONT_UI}`
  const descLines = wrap(ctx, desc, inner)
  for (const line of descLines) {
    if (draw) {
      ctx.fillStyle = INK_DIM
      ctx.fillText(line, PAD_X, y + 10)
    }
    y += 18.5
  }
  y += 6

  // ---- placement pill ----
  if (placement) {
    ctx.font = `400 11px ${FONT_UI}`
    const textLeft = PAD_X + 22
    const pillInner = WIDTH - PAD_X - textLeft - 10
    const lines = wrap(ctx, placement, pillInner)
    const pillH = lines.length * 16 + 16
    if (draw) {
      ctx.fillStyle = rgba(accent, 0.1)
      roundRect(ctx, PAD_X, y, inner, pillH, 8)
      ctx.fill()
      ctx.fillStyle = accentHex
      ctx.fillRect(PAD_X, y, 2, pillH)
      pin(ctx, PAD_X + 12, y + 16, 11, accentHex)
      ctx.fillStyle = INK
      lines.forEach((line, i) => ctx.fillText(line, textLeft, y + 16 + i * 16))
    }
    y += pillH + 12
  }

  // ---- buttons ----
  ctx.font = `600 10.5px ${FONT_UI}`
  let x = PAD_X
  const btnH = 22
  for (let i = 0; i < BUTTONS.length; i++) {
    const label = BUTTONS[i]
    const w = ctx.measureText(label).width + 20
    if (x + w > WIDTH - PAD_X && x > PAD_X) {
      x = PAD_X
      y += btnH + 6
    }
    if (draw) {
      roundRect(ctx, x, y, w, btnH, 7)
      if (i === 0) {
        ctx.fillStyle = accentHex
        ctx.fill()
        ctx.fillStyle = '#ffffff'
      } else {
        ctx.strokeStyle = LINE
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = INK_DIM
      }
      ctx.fillText(label, x + 10, y + 15)
    }
    x += w + 6
  }
  y += btnH + PAD_Y

  return y
}

/**
 * Builds a texture for one card. Returns the texture plus the card size in
 * CSS pixels, which the caller turns into a plane aspect. The caller owns the
 * texture and should dispose it when the content changes.
 */
export function createCardTexture(data) {
  // measure first, on a throwaway context, so the canvas is exactly tall enough
  const probe = document.createElement('canvas').getContext('2d')
  const height = Math.ceil(layout(probe, data, false))

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * PIXEL_SCALE
  canvas.height = height * PIXEL_SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(PIXEL_SCALE, PIXEL_SCALE)
  ctx.textBaseline = 'alphabetic'

  // panel
  ctx.fillStyle = PANEL
  roundRect(ctx, 0.5, 0.5, WIDTH - 1, height - 1, RADIUS)
  ctx.fill()
  ctx.strokeStyle = BORDER
  ctx.lineWidth = 1
  ctx.stroke()

  layout(ctx, data, true)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true

  return { texture, width: WIDTH, height }
}
