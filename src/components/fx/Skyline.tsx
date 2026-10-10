import { useMemo } from 'react'
import { cn } from '../../lib/cn'
import { rng } from '../../lib/rng'

const W = 1440
const H = 280

type Rect = { x: number; y: number; w: number; h: number }

/**
 * Generate a night-city skyline: a hazy far layer, a near layer of silhouettes
 * with setbacks, spires and rooftop water tanks, and a scatter of lit windows.
 * Everything is merged into a handful of paths so the DOM stays tiny.
 */
function buildCity(seed: number) {
  const r = rng(seed)
  const between = (a: number, b: number) => a + r() * (b - a)
  // Taller towers cluster toward the middle, like a downtown core.
  const core = (x: number) => Math.exp(-(((x - W * 0.58) / (W * 0.28)) ** 2))

  const rect = ({ x, y, w, h }: Rect) => `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}z`

  // Far layer: simple blocks.
  let far = ''
  for (let x = -20; x < W + 20; ) {
    const w = between(36, 110)
    const h = between(70, 150) + core(x) * between(30, 90)
    far += rect({ x, y: H - h, w, h })
    x += w - between(0, 12)
  }

  // Near layer: varied silhouettes plus windows.
  let near = ''
  const lit: Record<'warm' | 'red' | 'blue', string> = { warm: '', red: '', blue: '' }
  for (let x = -10; x < W + 10; ) {
    const tower = r() < 0.14
    const w = tower ? between(46, 76) : between(34, 104)
    const h = tower ? between(170, 240) : between(36, 120) + core(x) * between(20, 90)
    const top = H - h
    near += rect({ x, y: top, w, h })

    // Setback crown on taller buildings.
    if (h > 110 && r() < 0.55) {
      const sw = w * between(0.45, 0.7)
      const sh = between(14, 34)
      near += rect({ x: x + (w - sw) / 2, y: top - sh, w: sw, h: sh })
      if (tower) {
        const spire = between(18, 46)
        near += rect({ x: x + w / 2 - 1.2, y: top - sh - spire, w: 2.4, h: spire })
      }
    } else if (h < 90 && r() < 0.22) {
      // Rooftop water tank on legs.
      const tx = x + between(6, Math.max(8, w - 22))
      near += rect({ x: tx, y: top - 16, w: 14, h: 10 })
      near += rect({ x: tx + 2, y: top - 6, w: 1.6, h: 6 }) + rect({ x: tx + 10.4, y: top - 6, w: 1.6, h: 6 })
    }

    // Windows: a regular grid, sparsely lit.
    for (let wy = top + 10; wy < H - 8; wy += 11) {
      for (let wx = x + 6; wx < x + w - 7; wx += 8) {
        const roll = r()
        if (roll > 0.085) continue
        const tone = roll < 0.006 ? 'red' : roll < 0.014 ? 'blue' : 'warm'
        lit[tone] += rect({ x: wx, y: wy, w: 2.6, h: 4.2 })
      }
    }
    x += w + between(-6, 4)
  }

  return { far, near, lit }
}

interface SkylineProps {
  className?: string
  seed?: number
}

/**
 * A decorative night-city skyline pinned to the bottom of its (relatively
 * positioned) parent. Width-fills and crops the sides on narrow screens.
 */
export default function Skyline({ className, seed = 11 }: SkylineProps) {
  const { far, near, lit } = useMemo(() => buildCity(seed), [seed])
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className={cn('pointer-events-none absolute inset-x-0 bottom-0 w-full', className)}
    >
      <path d={far} fill="#141a30" opacity={0.75} />
      <path d={near} fill="#070910" />
      <path d={lit.warm} fill="rgba(255,212,150,0.55)" />
      <path d={lit.blue} fill="rgba(120,170,255,0.6)" />
      <path d={lit.red} fill="rgba(255,80,92,0.7)" />
    </svg>
  )
}
