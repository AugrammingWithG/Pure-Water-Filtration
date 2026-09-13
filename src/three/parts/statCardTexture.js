import {
  AMBER,
  cardCanvas,
  drawLabel,
  formatFigure,
  FONT_DISPLAY,
  FONT_UI,
  hex,
  INK,
  INK_DIM,
  LINE,
  measureContext,
  MINT,
  PAD_X,
  PAD_Y,
  rgba,
  roundRect,
  toTexture,
} from './cardDraw'

/**
 * The three system cards — annual cost, five-year cost, yearly impact — drawn
 * to canvas so they can hang in the scene beside the unit they describe.
 *
 * These are the same figures the DOM cards show, and they count up the same
 * way, but a canvas cannot be updated a character at a time: a change of value
 * means redrawing the card and re-uploading the texture. That is affordable
 * only because the count is a burst — under a second, on reveal or on a change
 * of system — and never a steady per-frame cost. StatCards caps how often it
 * redraws during that burst; see the note there.
 */

const WIDTH = 200
/** Years the savings card looks ahead, matching SavingsCard. */
export const YEARS = 5

/**
 * Figures grow from zero as `progress` runs 0..1.
 *
 * SYSTEM_DATA holds these as plain numbers, so how each one is written lives
 * here with the card that writes it rather than beside the value.
 */
const at = (value, progress) => value * progress
const MONEY = { prefix: '$' }
const LITRES = { unit: 'L' }
const KILOS = { unit: 'kg' }
const PLAIN = {}

// ---------------------------------------------------------------------------

function costLayout(ctx, { before, after }, progress, draw) {
  let y = PAD_Y
  if (draw) y = drawLabel(ctx, 'Annual water cost', y)
  else y += 20

  const columns = [
    { caption: 'Now', figure: before, colour: AMBER },
    { caption: 'Filtered', figure: after, colour: MINT },
  ]
  let x = PAD_X
  for (const col of columns) {
    if (draw) {
      ctx.font = `400 9.5px ${FONT_UI}`
      ctx.fillStyle = INK_DIM
      ctx.fillText(col.caption, x, y + 8)
      ctx.font = `600 19px ${FONT_DISPLAY}`
      ctx.fillStyle = col.colour
      ctx.fillText(formatFigure(at(col.figure, progress), MONEY), x, y + 28)
    }
    x += 88
  }
  y += 40

  // the saving, as its own pill
  const text = 'Saves ' + formatFigure(at(before - after, progress), MONEY) + '/yr'
  ctx.font = `700 12px ${FONT_UI}`
  const pillW = ctx.measureText(text).width + 24
  if (draw) {
    roundRect(ctx, PAD_X, y, pillW, 26, 8)
    ctx.fillStyle = rgba(MINT, 0.14)
    ctx.fill()
    ctx.fillStyle = MINT
    ctx.fillText(text, PAD_X + 12, y + 17)
  }
  y += 26 + PAD_Y
  return y
}

// ---------------------------------------------------------------------------

const PLOT_H = 46
const PLOT_PAD = 7
const TICK = 3

/**
 * The five-year plot: both lines run from a shared origin, and the wash
 * between them is the saving. Straight, because the spend is a rate — the
 * plot claims nothing about prices rising that the data does not.
 */
function savingsLayout(ctx, { before, after }, progress, draw) {
  let y = PAD_Y
  if (draw) y = drawLabel(ctx, YEARS + '-year water cost', y)
  else y += 20

  const unfiltered = before * YEARS
  const filtered = after * YEARS
  const plotW = WIDTH - PAD_X * 2

  if (draw) {
    const x0 = PAD_X + PLOT_PAD
    const x1 = PAD_X + plotW - PLOT_PAD
    const base = y + PLOT_H
    const height = (amount) => base - (amount / unfiltered) * (PLOT_H - PLOT_PAD)
    const yUn = height(unfiltered)
    const yFil = height(filtered)

    // the saving: everything between the two lines
    ctx.beginPath()
    ctx.moveTo(x0, base)
    ctx.lineTo(x1, yUn)
    ctx.lineTo(x1, yFil)
    ctx.closePath()
    ctx.fillStyle = rgba(MINT, 0.12)
    ctx.fill()

    // baseline with a tick per year
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x0, base)
    ctx.lineTo(x1, base)
    for (let i = 0; i <= YEARS; i++) {
      const tx = x0 + ((x1 - x0) * i) / YEARS
      ctx.moveTo(tx, base)
      ctx.lineTo(tx, base + TICK)
    }
    ctx.stroke()

    // filtered drawn last: where the lines nearly coincide, the one that says
    // "with the product" is the one to stay visible
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    for (const [target, colour] of [
      [yUn, AMBER],
      [yFil, MINT],
    ]) {
      ctx.strokeStyle = colour
      ctx.beginPath()
      ctx.moveTo(x0, base)
      ctx.lineTo(x1, target)
      ctx.stroke()
    }

    // end markers, ringed so they read apart where they overlap
    for (const [target, colour] of [
      [yUn, AMBER],
      [yFil, MINT],
    ]) {
      ctx.beginPath()
      ctx.arc(x1, target, 5, 0, Math.PI * 2)
      ctx.fillStyle = colour
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  y += PLOT_H + TICK + 12

  const rows = [
    { label: 'Unfiltered', value: unfiltered, dot: AMBER, strong: false },
    { label: 'Filtered', value: filtered, dot: MINT, strong: false },
    { label: 'Saved', value: unfiltered - filtered, dot: null, strong: true },
  ]
  for (const row of rows) {
    if (draw) {
      ctx.font = `${row.strong ? 700 : 500} 11px ${FONT_UI}`
      ctx.fillStyle = row.strong ? INK : INK_DIM
      let lx = PAD_X
      if (row.dot) {
        ctx.beginPath()
        ctx.arc(lx + 3, y + 6, 3, 0, Math.PI * 2)
        ctx.fillStyle = row.dot
        ctx.fill()
        ctx.fillStyle = INK_DIM
        lx += 11
      }
      ctx.fillText(row.label, lx, y + 10)
      const text = formatFigure(at(row.value, progress), MONEY)
      ctx.font = `600 11.5px ${FONT_DISPLAY}`
      ctx.fillStyle = row.strong ? hex(MINT) : INK
      ctx.fillText(text, WIDTH - PAD_X - ctx.measureText(text).width, y + 10)
    }
    y += 17
  }
  y += PAD_Y - 4
  return y
}

// ---------------------------------------------------------------------------

function impactLayout(ctx, { litres, bottles, waste }, progress, draw) {
  let y = PAD_Y
  if (draw) y = drawLabel(ctx, 'Estimated this year', y)
  else y += 20

  const rows = [
    { figure: litres, label: 'Litres filtered', format: LITRES },
    { figure: bottles, label: 'Bottles avoided', format: PLAIN },
    { figure: waste, label: 'Plastic waste diverted', format: KILOS },
  ]
  for (const row of rows) {
    if (draw) {
      ctx.font = `600 17px ${FONT_DISPLAY}`
      ctx.fillStyle = INK
      ctx.fillText(formatFigure(at(row.figure, progress), row.format), PAD_X, y + 14)
      ctx.font = `400 10px ${FONT_UI}`
      ctx.fillStyle = INK_DIM
      ctx.fillText(row.label, PAD_X, y + 26)
    }
    y += 34
  }
  y += PAD_Y - 6
  return y
}

const LAYOUTS = { cost: costLayout, savings: savingsLayout, impact: impactLayout }

/**
 * Build one stat card. `progress` runs 0..1 and scales every figure on it, so
 * the same call draws a mid-count frame and the settled card.
 */
export function createStatTexture(kind, data, progress = 1) {
  const layout = LAYOUTS[kind]
  const height = Math.ceil(layout(measureContext(), data, progress, false))
  const { canvas, ctx } = cardCanvas(WIDTH, height)
  layout(ctx, data, progress, true)
  return { texture: toTexture(canvas), width: WIDTH, height }
}
