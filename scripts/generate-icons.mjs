import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

const sizes = [72, 96, 128, 192, 512]

mkdirSync('public/icons', { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fond émeraude-forêt avec coins arrondis (radius 20%)
  ctx.fillStyle = '#0D5934'
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Lettre B blanche centrée
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${size * 0.55}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('B', size / 2, size / 2 + size * 0.03)

  writeFileSync(`public/icons/icon-${size}.png`, canvas.toBuffer('image/png'))
  console.log(`✓ icon-${size}.png`)
}
