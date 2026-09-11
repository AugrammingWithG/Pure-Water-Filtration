import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * The "PURE WATER FILTRATION" plate from the product photos, rendered once
 * to a canvas. Two variants: the navy plate on the white cabinet, and the
 * blue print straight onto the stainless unit (transparent background).
 */

const NAVY = '#1c2f7c'
const BLUE = '#1d6fd6'

function drawDroplet(ctx, cx, cy, size, colour) {
  // teardrop with a ring cut out of the bottom — close enough to the mark
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = colour
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.55, -size * 0.35, size * 0.8, size * 0.05, size * 0.8, size * 0.3)
  ctx.arc(0, size * 0.3, size * 0.8, 0, Math.PI, false)
  ctx.bezierCurveTo(-size * 0.8, size * 0.05, -size * 0.55, -size * 0.35, 0, -size)
  ctx.closePath()
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(0, size * 0.32, size * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.beginPath()
  ctx.arc(0, size * 0.32, size * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function makeLabelCanvas({ plate }) {
  const W = 512
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const ink = plate ? '#ffffff' : BLUE
  if (plate) {
    ctx.fillStyle = NAVY
    ctx.fillRect(0, 0, W, H)
    // little screw heads in the corners
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    for (const [x, y] of [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]]) {
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawDroplet(ctx, 88, 118, 58, ink)

  ctx.fillStyle = ink
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = '800 54px "Space Grotesk", "Arial Black", Arial, sans-serif'
  ctx.fillText('PURE WATER', 168, 76)
  ctx.font = '500 22px Inter, Arial, sans-serif'
  const spaced = 'F I L T R A T I O N'
  ctx.fillText(spaced, 172, 122)
  ctx.font = '800 52px "Space Grotesk", "Arial Black", Arial, sans-serif'
  ctx.fillText('1300 720 031', 168, 186)

  return canvas
}

export function useBrandLabel({ plate = true } = {}) {
  return useMemo(() => {
    const tex = new THREE.CanvasTexture(makeLabelCanvas({ plate }))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [plate])
}
