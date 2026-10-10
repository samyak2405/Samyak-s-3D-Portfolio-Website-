import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import type { SkillCategory } from '../../types/portfolio'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

/**
 * Skills: a short index of groups strung on a web thread, and a web that shows
 * the chosen group's skills.
 *
 * Desktop (lg+): the groups are a vertical tab list on the left; the selected
 * group's skills hang in a full orb web on the right, each at the end of a
 * spoke, with rings sagging between them. Choosing another group re-spins the
 * web. Below lg there is no room beside the list, so a group opens in place
 * instead, spinning a small web off the thread under its name.
 *
 * The thread down the left edge spins out as you scroll and each group's knot
 * lights red as it is reached. Under reduced motion everything is shown in its
 * finished state.
 */

const TIP_LINE = '62%'
const WIDE = '(min-width: 1024px)'
const MD = '(min-width: 768px)'

type Pt = { x: number; y: number }
type Place = 'right' | 'left' | 'top' | 'bottom'

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

const r1 = (n: number) => Math.round(n * 10) / 10

/** A ring through the given points, each segment sagging toward the hub. */
function ringPath(pts: Pt[], hub: Pt, closed: boolean) {
  const seq = closed ? [...pts, pts[0]] : pts
  let d = `M${r1(seq[0].x)} ${r1(seq[0].y)}`
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1]
    const b = seq[i]
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const tx = hub.x - mx
    const ty = hub.y - my
    const l = Math.hypot(tx, ty) || 1
    const sag = Math.hypot(b.x - a.x, b.y - a.y) * 0.16
    d += `Q${r1(mx + (tx / l) * sag)} ${r1(my + (ty / l) * sag)} ${r1(b.x)} ${r1(b.y)}`
  }
  return d
}

// ---------------------------------------------------------------------------
// Desktop: a full orb web centred in the stage
// ---------------------------------------------------------------------------

interface Orb {
  hub: Pt
  r: number
  nodes: Array<Pt & { place: Place }>
  spokes: string[]
  spokeNode: number[]
  rings: string[]
}

function layoutOrb(count: number, w: number, h: number): Orb {
  const hub = { x: w / 2, y: h / 2 }
  const r = Math.max(110, Math.min(w / 2 - 175, h / 2 - 58))
  const n = Math.max(count, 1)
  // Twice as many spokes as skills: every other spoke carries a skill.
  const spokeCount = Math.max(2 * n, 8)
  const per = spokeCount / n
  const angles = Array.from({ length: spokeCount }, (_, k) => -Math.PI / 2 + (k * 2 * Math.PI) / spokeCount)

  const nodes = Array.from({ length: count }, (_, i) => {
    const a = angles[Math.round(i * per)]
    const c = Math.cos(a)
    const s = Math.sin(a)
    const place: Place = c > 0.35 ? 'right' : c < -0.35 ? 'left' : s < 0 ? 'top' : 'bottom'
    return { x: hub.x + r * c, y: hub.y + r * s, place }
  })
  const spokeNode = angles.map((_, k) => {
    const i = k / per
    return Number.isInteger(i) && i < count ? i : -1
  })

  // Anchor lines run out to the edge of the stage; a mask fades them.
  const spokes = angles.map((a) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    const reach = Math.min(Math.abs(c) > 1e-6 ? (w / 2) / Math.abs(c) : Infinity, Math.abs(s) > 1e-6 ? (h / 2) / Math.abs(s) : Infinity)
    return `M${r1(hub.x)} ${r1(hub.y)}L${r1(hub.x + c * reach)} ${r1(hub.y + s * reach)}`
  })
  const rings = [0.14, 0.27, 0.4, 0.53, 0.66, 0.79, 0.92, 1.06, 1.22].map((f) =>
    ringPath(
      angles.map((a) => ({ x: hub.x + Math.cos(a) * r * f, y: hub.y + Math.sin(a) * r * f })),
      hub,
      true,
    ),
  )
  return { hub, r, nodes, spokes, spokeNode, rings }
}

interface StageProps {
  id: string
  labelledBy: string
  category: SkillCategory
  reduced: boolean
  /** Bumps when the stage first scrolls into view, to play the first spin. */
  armed: boolean
}

function SkillStage({ id, labelledBy, category, reduced, armed }: StageProps) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState(-1)
  const maskId = useId().replace(/:/g, '')

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const orb = useMemo(() => layoutOrb(category.items.length, size.w, size.h), [category.items.length, size.w, size.h])

  // Spin the web each time a group is chosen (and the first time it's seen).
  useLayoutEffect(() => {
    const el = box.current
    if (!el || !size.w || reduced || !armed) return
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo('.orb-hub', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
        .fromTo('.orb-spoke', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power2.out', stagger: 0.025 }, 0.05)
        .fromTo('.orb-ring', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power1.inOut', stagger: 0.07 }, 0.25)
        .fromTo('.orb-label', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.06 }, 0.45)
    }, el)
    return () => ctx.revert()
  }, [category.name, size.w, size.h, reduced, armed])

  return (
    <div
      ref={box}
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className={cn('skill-stage relative h-full min-h-[460px] outline-none', (armed || reduced) && 'is-armed')}
    >
      {size.w > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0" width={size.w} height={size.h} fill="none">
            <defs>
              <radialGradient id={`${maskId}g`} gradientUnits="userSpaceOnUse" cx={orb.hub.x} cy={orb.hub.y} r={orb.r * 1.75}>
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.62" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id={`${maskId}m`}>
                <rect width={size.w} height={size.h} fill={`url(#${maskId}g)`} />
              </mask>
            </defs>
            <g mask={`url(#${maskId}m)`}>
              {orb.rings.map((d, i) => (
                <path key={`${category.name}r${i}`} className="orb-strand orb-ring" d={d} pathLength={1} strokeDasharray="1 1" />
              ))}
              {orb.spokes.map((d, i) => (
                <path
                  key={`${category.name}s${i}`}
                  className={cn(
                    'orb-strand orb-spoke',
                    orb.spokeNode[i] >= 0 && 'is-skill',
                    orb.spokeNode[i] >= 0 && orb.spokeNode[i] === hover && 'is-hot',
                  )}
                  d={d}
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
            </g>
            <circle className="orb-hub" cx={orb.hub.x} cy={orb.hub.y} r={6} />
          </svg>
          <ul aria-label={`${category.name} skills`}>
            {category.items.map((item, i) => {
              const node = orb.nodes[i]
              return (
                <li
                  key={`${category.name}-${item.name}`}
                  className={cn('orb-pin absolute', `is-${node.place}`)}
                  style={{ left: node.x, top: node.y }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(-1)}
                >
                  <span className="orb-label">
                    <span aria-hidden className={cn('web-node', item.recent && 'is-recent')} />
                    <span className="orb-text">
                      {item.name}
                      {item.recent && <span className="sr-only"> (recent)</span>}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Below lg: a small web fanned off the thread, opened in place
// ---------------------------------------------------------------------------

interface Fan {
  height: number
  hub: Pt
  nodes: Pt[]
  spokes: string[]
  spokeNode: number[]
  rings: string[]
}

function layoutFan(count: number, width: number, md: boolean): Fan {
  const threadX = md ? 22 : 15
  const step = md ? 48 : 44
  const height = 60 + count * step
  const hub = { x: threadX, y: 24 }
  const labelRoom = md ? 220 : 156
  const top = 16
  const bottom = height - 28
  const maxAngle = (62 * Math.PI) / 180
  const ry = (bottom - hub.y) / Math.sin(maxAngle)
  const rx = Math.max(110, Math.min(width - threadX - labelRoom, ry * 2.1))

  const nodes: Pt[] = Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.45 : i / (count - 1)
    const y = top + (bottom - top) * t
    const s = Math.max(-1, Math.min(1, (y - hub.y) / ry))
    return { x: hub.x + rx * Math.cos(Math.asin(s)), y }
  })

  type Spoke = { angle: number; len: number; node: number }
  const polar = (p: Pt) => ({ angle: Math.atan2(p.y - hub.y, p.x - hub.x), len: Math.hypot(p.x - hub.x, p.y - hub.y) })
  const list: Spoke[] = []
  nodes.forEach((p, i) => {
    const a = polar(p)
    list.push({ ...a, node: i })
    const next = nodes[i + 1]
    if (next) {
      const b = polar(next)
      list.push({ angle: (a.angle + b.angle) / 2, len: ((a.len + b.len) / 2) * 0.86, node: -1 })
    }
  })
  const last = polar(nodes[nodes.length - 1])
  const tail = Math.min(last.angle + 0.3, 1.35)
  list.push({ angle: tail, len: Math.min(last.len * 0.75, (height - 6 - hub.y) / Math.sin(tail)), node: -1 })

  const at = (s: Spoke, f: number): Pt => ({ x: hub.x + Math.cos(s.angle) * s.len * f, y: hub.y + Math.sin(s.angle) * s.len * f })
  return {
    height,
    hub,
    nodes,
    spokes: list.map((s) => {
      const e = at(s, 1)
      return `M${hub.x} ${hub.y}L${r1(e.x)} ${r1(e.y)}`
    }),
    spokeNode: list.map((s) => s.node),
    rings: [0.17, 0.33, 0.49, 0.65, 0.81].map((f) => ringPath(list.map((s) => at(s, f)), hub, false)),
  }
}

interface RowProps {
  category: SkillCategory
  open: boolean
  width: number
  md: boolean
  reduced: boolean
  onToggle: () => void
}

function SkillRow({ category, open, width, md, reduced, onToggle }: RowProps) {
  const id = useId().replace(/:/g, '')
  const panel = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(-1)
  const fan = useMemo(() => layoutFan(category.items.length, width, md), [category.items.length, width, md])

  useEffect(() => {
    const el = panel.current
    if (!open || reduced || !el || !width) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.12 })
        .fromTo('.web-hub', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
        .fromTo('.web-spoke', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, ease: 'power2.out', stagger: 0.04 }, 0.05)
        .fromTo('.web-ring', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.6, ease: 'power2.out', stagger: 0.06 }, 0.3)
        .fromTo('.web-label', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 }, 0.25)
    }, el)
    return () => ctx.revert()
  }, [open, reduced, width])

  return (
    <div className="skill-row" data-open={open || undefined} style={{ ['--panel-h' as string]: `${fan.height}px` }}>
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="skill-head relative flex w-full items-center py-3.5 pl-10 pr-2 text-left md:pl-14"
        >
          <span aria-hidden className="skill-knot" />
          <span className="skill-name font-display text-[1.45rem] font-bold leading-none md:text-[1.6rem]">
            {category.name}
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
          <div className="relative" style={{ height: fan.height }}>
            <svg aria-hidden className="absolute inset-0 overflow-visible" width={width} height={fan.height} fill="none">
              {fan.rings.map((d, i) => (
                <path key={`r${i}`} className="web-ring" d={d} pathLength={1} strokeDasharray="1 1" />
              ))}
              {fan.spokes.map((d, i) => (
                <path
                  key={`s${i}`}
                  className={cn('web-spoke', fan.spokeNode[i] >= 0 && 'is-skill', fan.spokeNode[i] === hover && hover >= 0 && 'is-hot')}
                  d={d}
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
              <circle className="web-hub" cx={fan.hub.x} cy={fan.hub.y} r={5} />
            </svg>
            <ul>
              {category.items.map((item, i) => (
                <li
                  key={item.name}
                  className="absolute -translate-y-1/2"
                  style={{ left: fan.nodes[i].x - 4, top: fan.nodes[i].y, maxWidth: md ? 220 : 150 }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(-1)}
                >
                  <span className="web-label flex items-center gap-2.5">
                    <span aria-hidden className={cn('web-node', item.recent && 'is-recent')} />
                    <span className="text-[0.98rem] leading-tight text-steel-100">
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

// ---------------------------------------------------------------------------

export default function Skills() {
  const { skills } = usePortfolio()
  const categories = skills.categories
  const list = useRef<HTMLDivElement>(null)
  const wide = useMatch(WIDE)
  const md = useMatch(MD)
  const ids = useId().replace(/:/g, '')
  const [width, setWidth] = useState(0)
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // Desktop: which group the web shows. Below lg: which group is open in place.
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(reduced ? 0 : null)
  const [armed, setArmed] = useState(reduced)
  const touched = useRef(false)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])

  useLayoutEffect(() => {
    const el = list.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Row heights change when a group opens in place: re-measure every trigger.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 700)
    return () => window.clearTimeout(t)
  }, [open, wide])

  const choose = (i: number) => {
    touched.current = true
    setArmed(true)
    setActive(i)
  }
  const toggle = (i: number) => {
    touched.current = true
    setOpen((cur) => (cur === i ? null : i))
  }

  // Vertical tabs: arrows / Home / End move selection and focus.
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = categories.length - 1
    const next =
      e.key === 'ArrowDown' ? (active === last ? 0 : active + 1)
      : e.key === 'ArrowUp' ? (active === 0 ? last : active - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  const scope = useGsap<HTMLElement>(({ gsap, ScrollTrigger, reduced: rm }) => {
    const root = list.current
    if (!root) return
    const rows = gsap.utils.toArray<HTMLElement>('.skill-row', root)
    if (rm) {
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
    rows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: `top+=24 ${TIP_LINE}`,
        end: 'max',
        toggleClass: { targets: row, className: 'is-reached' },
      })
    })
    // First arrival: spin the first web (desktop) or open the first group in
    // place (smaller screens), unless the visitor already chose one.
    ScrollTrigger.create({
      trigger: root,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        setArmed(true)
        if (!touched.current) setOpen((cur) => (cur === null ? 0 : cur))
      },
    })
  }, [wide])

  return (
    <section ref={scope} id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <WebBackdrop corner="tr" seed={17} strength={0.08} size="min(85vw, 640px)" />
      <div className="container-edge relative">
        <SectionHeading
          label="skills"
          title="What I build with"
          lead="Grouped by where each tool lives in a system. Pick a group to see its web; blue knots mark what I've picked up most recently."
        />

        <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:items-stretch lg:gap-12">
          <div
            ref={list}
            className="skill-index relative self-center"
            {...(wide ? { role: 'tablist', 'aria-orientation': 'vertical' as const, 'aria-label': 'Skill groups', onKeyDown: onTabKey } : {})}
          >
            <span aria-hidden className="skill-thread" />
            <span aria-hidden className="skill-thread skill-thread-spun" />
            {categories.map((category, i) =>
              wide ? (
                <div key={category.name} role="presentation" className="skill-row" data-active={active === i || undefined}>
                  <button
                    ref={(el) => {
                      tabs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`${ids}-tab-${i}`}
                    aria-selected={active === i}
                    aria-controls={`${ids}-stage`}
                    tabIndex={active === i ? 0 : -1}
                    onClick={() => choose(i)}
                    className="skill-head relative flex w-full items-center py-3 pl-14 pr-2 text-left"
                  >
                    <span aria-hidden className="skill-knot" />
                    <span className="skill-name font-display text-[1.6rem] font-bold leading-none">{category.name}</span>
                  </button>
                </div>
              ) : (
                <SkillRow
                  key={category.name}
                  category={category}
                  open={open === i}
                  width={width}
                  md={md}
                  reduced={reduced}
                  onToggle={() => toggle(i)}
                />
              ),
            )}
          </div>

          {wide && (
            <SkillStage
              id={`${ids}-stage`}
              labelledBy={`${ids}-tab-${active}`}
              category={categories[active]}
              reduced={reduced}
              armed={armed}
            />
          )}
        </div>
      </div>
    </section>
  )
}
