import { useId, useMemo } from 'react'
import { useGsap } from '../../hooks/useGsap'
import { cn } from '../../lib/cn'
import { rng } from '../../lib/rng'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

interface WebBackdropProps {
  /** Corner of the section the web is strung from. */
  corner: Corner
  /** CSS size of the square web, e.g. "min(80vw, 760px)". */
  size?: string
  /** Strand opacity, 0..1. Keep it low; this sits behind content. */
  strength?: number
  seed?: number
  /** "scroll" spins the web as it enters view, "load" on mount, "none" static. */
  draw?: 'scroll' | 'load' | 'none'
  /** Delay (s) before spinning, for "load". */
  delay?: number
  className?: string
}

const VB = 1000
const START_ANGLE: Record<Corner, number> = { tl: 0, tr: 90, br: 180, bl: 270 }

type Pt = [number, number]

/**
 * Build an orb-web strung from one corner: radial spokes, then rings whose
 * strands sag towards the hub like real silk. Seeded jitter keeps it organic
 * without looking random on every load.
 */
function buildWeb(corner: Corner, seed: number) {
  const r = rng(seed)
  const hub: Pt = [corner.endsWith('r') ? VB : 0, corner.startsWith('b') ? VB : 0]
  const jit = (n: number) => (r() * 2 - 1) * n

  const SPOKES = 12
  const angles = Array.from({ length: SPOKES }, (_, i) => {
    const a = START_ANGLE[corner] - 8 + (106 * i) / (SPOKES - 1) + jit(2.5)
    return (a * Math.PI) / 180
  })
  const at = (a: number, len: number): Pt => [hub[0] + Math.cos(a) * len, hub[1] + Math.sin(a) * len]
  const f = (n: number) => Math.round(n * 10) / 10

  const spokes = angles.map((a) => {
    const [x, y] = at(a, 1500)
    return `M${hub[0]} ${hub[1]}L${f(x)} ${f(y)}`
  })

  const rings: string[] = []
  for (let R = 68; R < 1500; R *= 1.22 + r() * 0.06) {
    const pts = angles.map((a) => at(a, R * (1 + jit(0.045))))
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const mx = (x0 + x1) / 2
      const my = (y0 + y1) / 2
      const chord = Math.hypot(x1 - x0, y1 - y0)
      const toHubX = hub[0] - mx
      const toHubY = hub[1] - my
      const len = Math.hypot(toHubX, toHubY) || 1
      const sag = chord * (0.14 + r() * 0.06)
      d += `Q${f(mx + (toHubX / len) * sag)} ${f(my + (toHubY / len) * sag)} ${f(x1)} ${f(y1)}`
    }
    rings.push(d)
  }
  return { hub, spokes, rings }
}

/**
 * A spider web strung from one corner of its (relatively positioned) parent.
 * Purely decorative: aria-hidden, no pointer events, clipped to the parent.
 * Under reduced motion it renders already spun.
 */
export default function WebBackdrop({
  corner,
  size = 'min(80vw, 760px)',
  strength = 0.14,
  seed = 7,
  draw = 'scroll',
  delay = 0,
  className,
}: WebBackdropProps) {
  const { hub, spokes, rings } = useMemo(() => buildWeb(corner, seed), [corner, seed])
  const id = useId().replace(/:/g, '')

  const scope = useGsap<HTMLDivElement>(({ gsap, scope, reduced }) => {
    if (reduced || draw === 'none') return
    const strands = scope.querySelectorAll('.web-strand')
    gsap.set(strands, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } })
    gsap.to(strands, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 1.5,
      ease: 'power2.out',
      stagger: 0.04,
      delay,
      scrollTrigger:
        draw === 'scroll' ? { trigger: scope.parentElement ?? scope, start: 'top 75%', once: true } : undefined,
    })
  })

  const pos = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  }[corner]

  return (
    <div ref={scope} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="absolute"
        style={{ width: size, height: size, ...pos }}
        fill="none"
      >
        <defs>
          <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={hub[0]} cy={hub[1]} r={1150}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}m`}>
            <rect width={VB} height={VB} fill={`url(#${id}g)`} />
          </mask>
        </defs>
        <g mask={`url(#${id}m)`} stroke={`rgba(236,238,244,${strength})`} strokeLinecap="round">
          {spokes.map((d, i) => (
            <path key={`s${i}`} className="web-strand" d={d} pathLength={1} strokeWidth={1.7} />
          ))}
          {rings.map((d, i) => (
            <path key={`r${i}`} className="web-strand" d={d} pathLength={1} strokeWidth={1.3} />
          ))}
        </g>
      </svg>
    </div>
  )
}
