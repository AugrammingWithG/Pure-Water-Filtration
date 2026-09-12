import * as THREE from 'three'

/** Frame time is clamped so a stalled tab doesn't teleport every particle. */
export const MAX_DELTA = 0.05

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** 0 below `edge0`, 1 above `edge1`, eased in between. */
export function smoothstep(edge0, edge1, x) {
  if (edge1 === edge0) return x < edge0 ? 0 : 1
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export const lerp = (a, b, t) => a + (b - a) * t

let dot = null
let star = null

/**
 * Soft round dot, drawn once and shared. Used by the mineral flecks and the
 * output sparkles so they read as glints rather than hard squares.
 */
export function getDotTexture() {
  if (dot) return dot
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  dot = new THREE.CanvasTexture(canvas)
  dot.colorSpace = THREE.SRGBColorSpace
  return dot
}

/**
 * A four-point star: soft core plus four tapered arms. A plain round dot at
 * glint size just reads as a pale blob; the arms are what make the eye call it
 * a sparkle, and because they are thin most of the sprite stays transparent so
 * it can be drawn larger without turning into a smudge.
 */
export function getStarTexture() {
  if (star) return star
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  const core = ctx.createRadialGradient(c, c, 0, c, c, size * 0.15)
  core.addColorStop(0, 'rgba(255,255,255,1)')
  core.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, size, size)

  // arms are additive so the four overlap cleanly at the centre
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate((i * Math.PI) / 2)
    const arm = ctx.createLinearGradient(0, 0, 0, -size * 0.47)
    arm.addColorStop(0, 'rgba(255,255,255,0.85)')
    arm.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = arm
    ctx.beginPath()
    ctx.moveTo(-size * 0.03, 0)
    ctx.lineTo(0, -size * 0.47)
    ctx.lineTo(size * 0.03, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  star = new THREE.CanvasTexture(canvas)
  star.colorSpace = THREE.SRGBColorSpace
  return star
}
