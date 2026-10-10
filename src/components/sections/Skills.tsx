import { Plus } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import type { SkillCategory } from '../../types/portfolio'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

/**
 * Skills as an index strung on a single web thread.
 *
 * Each category is a compact row. A silk thread runs down the left edge and
 * spins out as you scroll; each row's knot lights red as the thread reaches it.
 * Opening a row spins a small web off the thread: spokes fan out from a hub on
 * the thread and each skill hangs at the end of one, with sagging rings between
 * them. One row is open at a time; the first opens by itself the first time
 * the section comes into view, so the interaction explains itself.
 *
 * Under reduced motion the thread is fully spun, every knot is lit and webs
 * appear without being drawn.
 */

// Where the thread's tip sits in the viewport while it spins (from the top).
const TIP_LINE = '62%'
const MD = '(min-width: 768px)'

type Pt = { x: number; y: number }
interface WebGeometry {
  height: number
  hub: Pt
  nodes: Pt[]
  spokes: string[]
  /** Index into `nodes` for each spoke, or -1 for a bare (decorative) spoke. */
  spokeNode: number[]
  rings: string[]
}

/**
 * Lay out one category's web in panel coordinates. Skills sit on an elliptical
 * arc to the right of a hub on the thread, evenly spaced top to bottom, with
 * room left for their labels. Bare spokes between them and sagging rings across
 * all spokes make it read as silk rather than a chart.
 */
function layoutWeb(count: number, width: number, wide: boolean): WebGeometry {
  const threadX = wide ? 22 : 15
  const step = wide ? 50 : 46
  const height = 64 + count * step
  const hub = { x: threadX, y: 26 }
  const labelRoom = wide ? 250 : 156
  const top = 18
  const bottom = height - 30
  // The lowest skill sits ~62° below the hub, so the arc never folds back
  // onto the thread; the web stays roughly round (rx capped against ry) so it
  // reads as an orb web rather than a fan of long lines.
  const maxAngle = (62 * Math.PI) / 180
  const ry = (bottom - hub.y) / Math.sin(maxAngle)
  const rx = Math.max(110, Math.min(width - threadX - labelRoom, ry * 2.1))

  const nodes: Pt[] = Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.45 : i / (count - 1)
    const y = top + (bottom - top) * t
    const s = Math.max(-1, Math.min(1, (y - hub.y) / ry))
    return { x: hub.x + rx * Math.cos(Math.asin(s)), y }
  })

  // Spokes in angle order: skill spokes, a bare one between each pair, and one
  // short bare spoke below the last.
  type Spoke = { angle: number; len: number; node: number }
  const polar = (p: Pt) => ({ angle: Math.atan2(p.y - hub.y, p.x - hub.x), len: Math.hypot(p.x - hub.x, p.y - hub.y) })
  const spokes: Spoke[] = []
  nodes.forEach((p, i) => {
    const a = polar(p)
    spokes.push({ ...a, node: i })
    const next = nodes[i + 1]
    if (next) {
      const b = polar(next)
      spokes.push({ angle: (a.angle + b.angle) / 2, len: ((a.len + b.len) / 2) * 0.86, node: -1 })
    }
  })
  const last = polar(nodes[nodes.length - 1])
  const tailAngle = Math.min(last.angle + 0.3, 1.35)
  spokes.push({ angle: tailAngle, len: Math.min(last.len * 0.75, (height - 6 - hub.y) / Math.sin(tailAngle)), node: -1 })

  const at = (s: Spoke, f: number): Pt => ({ x: hub.x + Math.cos(s.angle) * s.len * f, y: hub.y + Math.sin(s.angle) * s.len * f })
  const r1 = (n: number) => Math.round(n * 10) / 10

  const spokePaths = spokes.map((s) => {
    const end = at(s, 1)
    return `M${hub.x} ${hub.y}L${r1(end.x)} ${r1(end.y)}`
  })
  const rings = [0.17, 0.33, 0.49, 0.65, 0.81].map((f) => {
    const pts = spokes.map((s) => at(s, f))
    let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      const toHubX = hub.x - mx
      const toHubY = hub.y - my
      const l = Math.hypot(toHubX, toHubY) || 1
      const sag = Math.hypot(b.x - a.x, b.y - a.y) * 0.16
      d += `Q${r1(mx + (toHubX / l) * sag)} ${r1(my + (toHubY / l) * sag)} ${r1(b.x)} ${r1(b.y)}`
    }
    return d
  })

  return { height, hub, nodes, spokes: spokePaths, spokeNode: spokes.map((s) => s.node), rings }
}

function useMatch(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

interface RowProps {
  category: SkillCategory
  open: boolean
  width: number
  wide: boolean
  reduced: boolean
  onToggle: () => void
}

function SkillRow({ category, open, width, wide, reduced, onToggle }: RowProps) {
  const id = useId().replace(/:/g, '')
  const panel = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(-1)
  const geo = useMemo(() => layoutWeb(category.items.length, width, wide), [category.items.length, width, wide])

  // Spin the web each time the row opens: spokes out from the hub, then the
  // rings, then each skill slides out along its spoke.
  useEffect(() => {
    const el = panel.current
    if (!open || reduced || !el || !width) return
    const ctx = gsap.context(() => {
      const spokes = el.querySelectorAll('.web-spoke')
      const rings = el.querySelectorAll('.web-ring')
      gsap
        .timeline({ delay: 0.12 })
        .fromTo('.web-hub', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
        .fromTo(spokes, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, ease: 'power2.out', stagger: 0.04 }, 0.05)
        .fromTo(rings, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.6, ease: 'power2.out', stagger: 0.06 }, 0.3)
        .fromTo('.web-label', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 }, 0.25)
    }, el)
    return () => ctx.revert()
  }, [open, reduced, width])

  return (
    <div
      className={cn('skill-row', open && 'is-open')}
      style={{ ['--panel-h' as string]: `${geo.height}px` }}
    >
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="skill-head group/head relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-8 py-4 pl-10 text-left md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto] md:py-5 md:pl-14"
        >
          <span aria-hidden className="skill-knot" />
          <span className="font-display text-[1.7rem] font-bold leading-[1] text-[color:var(--moonlight)] md:text-[2.1rem]">
            {category.name}
          </span>
          <span aria-hidden className="skill-preview hidden truncate text-[0.95rem] text-steel-500 md:block">
            {category.items.map((item) => item.name).join(', ')}
          </span>
          <span className="flex items-center gap-3 text-sm tabular-nums text-steel-400">
            <span>
              {category.items.length}
              <span className="sr-only"> skills</span>
            </span>
            <span className="skill-toggle grid h-8 w-8 place-items-center rounded-full border border-white/15">
              <Plus size={15} strokeWidth={1.75} />
            </span>
          </span>
        </button>
      </h3>

      <div
        ref={panel}
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className="skill-panel relative"
        {...(!open ? { inert: '' } : {})}
      >
        {width > 0 && (
          <div className="relative" style={{ height: geo.height }}>
            <svg aria-hidden className="absolute inset-0 overflow-visible" width={width} height={geo.height} fill="none">
              {geo.rings.map((d, i) => (
                <path key={`r${i}`} className="web-ring" d={d} pathLength={1} strokeDasharray="1 1" />
              ))}
              {geo.spokes.map((d, i) => (
                <path
                  key={`s${i}`}
                  className={cn('web-spoke', geo.spokeNode[i] >= 0 && 'is-skill', geo.spokeNode[i] === hover && hover >= 0 && 'is-hot')}
                  d={d}
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
              <circle className="web-hub" cx={geo.hub.x} cy={geo.hub.y} r={5} />
            </svg>
            <ul>
              {category.items.map((item, i) => (
                <li
                  key={item.name}
                  className="absolute -translate-y-1/2"
                  style={{ left: geo.nodes[i].x - 4, top: geo.nodes[i].y, maxWidth: wide ? 240 : 150 }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(-1)}
                >
                  <span className="web-label flex items-center gap-2.5">
                    <span aria-hidden className={cn('web-node', item.recent && 'is-recent')} />
                    <span className="text-[0.98rem] leading-tight text-steel-100 md:text-[1.06rem]">
                      {item.name}
                      {item.recent && <span className="sr-only"> (recent)</span>}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Skills() {
  const { skills } = usePortfolio()
  const list = useRef<HTMLDivElement>(null)
  const wide = useMatch(MD)
  const [width, setWidth] = useState(0)
  const [reducedPref] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // Reduced motion: the first web is simply open. Otherwise it spins open the
  // first time the list scrolls into view (unless the visitor got there first).
  const [open, setOpen] = useState<number | null>(reducedPref ? 0 : null)
  const touched = useRef(false)

  useLayoutEffect(() => {
    const el = list.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Row heights change when a web opens or closes: re-measure every trigger
  // on the page once the panel has finished moving.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 700)
    return () => window.clearTimeout(t)
  }, [open])

  const toggle = (i: number) => {
    touched.current = true
    setOpen((cur) => (cur === i ? null : i))
  }

  const scope = useGsap<HTMLElement>(({ gsap, ScrollTrigger, reduced }) => {
    const root = list.current
    if (!root) return
    const rows = gsap.utils.toArray<HTMLElement>('.skill-row', root)
    if (reduced) {
      gsap.set('.skill-thread-spun', { scaleY: 1 })
      rows.forEach((row) => row.classList.add('is-reached'))
      return
    }

    gsap.fromTo(
      '.skill-thread-spun',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: `top ${TIP_LINE}`, end: `bottom ${TIP_LINE}`, scrub: 0.4 },
      },
    )
    // A knot lights once the thread's tip has reached its row.
    rows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: `top+=30 ${TIP_LINE}`,
        end: 'max',
        toggleClass: { targets: row, className: 'is-reached' },
      })
    })
    ScrollTrigger.create({
      trigger: root,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (!touched.current) setOpen((cur) => (cur === null ? 0 : cur))
      },
    })
  })

  return (
    <section ref={scope} id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <WebBackdrop corner="tr" seed={17} strength={0.08} size="min(85vw, 640px)" />
      <div className="container-edge relative">
        <SectionHeading
          label="skills"
          title="What I build with"
          lead="Grouped by where each tool lives in a system. Open a group to spin out its web; a blue knot marks what I've picked up most recently."
        />

        <div ref={list} className="skill-index relative mt-12 md:mt-16">
          <span aria-hidden className="skill-thread" />
          <span aria-hidden className="skill-thread skill-thread-spun" />
          {skills.categories.map((category, i) => (
            <SkillRow
              key={category.name}
              category={category}
              open={open === i}
              width={width}
              wide={wide}
              reduced={reducedPref}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
