import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
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
 * Desktop (lg+): the groups are a vertical tab list on the left (hover or
 * click to choose); the selected
 * group's skills hang in a living 3D orb web on the right (see SkillStage). Below lg there is no room beside the list, so a group opens in place
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
// Desktop: a living 3D orb web
// ---------------------------------------------------------------------------

/**
 * The web is modelled on a flat plane in 3D and drawn in perspective each
 * frame: it leans toward the pointer, sways a little on its own, its strands
 * ripple like silk, and hovering a skill plucks that skill's strand. Choosing a
 * group spins a fresh web in from depth.
 */

interface WebModel {
  r: number
  reach: number
  angles: number[]
  /** Node index carried by each spoke, or -1. */
  spokeNode: number[]
  /** Spoke index for each node. */
  nodeSpoke: number[]
  places: Place[]
  rings: number[]
}

function modelFor(count: number, w: number, h: number): WebModel {
  const r = Math.max(110, Math.min(w / 2 - 180, h / 2 - 64))
  const n = Math.max(count, 1)
  const spokeCount = Math.max(2 * n, 8)
  const per = spokeCount / n
  const angles = Array.from({ length: spokeCount }, (_, k) => -Math.PI / 2 + (k * 2 * Math.PI) / spokeCount)
  const nodeSpoke = Array.from({ length: count }, (_, i) => Math.round(i * per))
  const spokeNode = angles.map((_, k) => nodeSpoke.indexOf(k))
  const places = nodeSpoke.map((k): Place => {
    const c = Math.cos(angles[k])
    const sn = Math.sin(angles[k])
    return c > 0.35 ? 'right' : c < -0.35 ? 'left' : sn < 0 ? 'top' : 'bottom'
  })
  return {
    r,
    reach: r * 1.9,
    angles,
    spokeNode,
    nodeSpoke,
    places,
    rings: [0.14, 0.27, 0.4, 0.53, 0.66, 0.79, 0.92, 1.06, 1.22],
  }
}

const FOCAL = 900
const BASE_TILT = 0.22 // radians: the web leans back a touch even at rest

interface Motion {
  t: number
  rx: number
  ry: number
  spin: number
  depth: number
  sc: number
  pluckSpoke: number
  pluckAt: number
}

interface StageProps {
  id: string
  labelledBy: string
  category: SkillCategory
  reduced: boolean
  /** True once the stage has been seen (or a group chosen): spin the web. */
  armed: boolean
}

function SkillStage({ id, labelledBy, category, reduced, armed }: StageProps) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState(-1)
  const maskId = useId().replace(/:/g, '')

  const model = useMemo(() => modelFor(category.items.length, size.w, size.h), [category.items.length, size.w, size.h])
  const live = useRef({ model, size })
  live.current = { model, size }

  const els = useRef({
    spokes: [] as Array<SVGPathElement | null>,
    rings: [] as Array<SVGPathElement | null>,
    labels: [] as Array<HTMLLIElement | null>,
    hub: null as SVGCircleElement | null,
  })
  const motion = useRef<Motion>({ t: 0, rx: BASE_TILT, ry: -0.1, spin: 0, depth: 0, sc: 1, pluckSpoke: -1, pluckAt: -10 })
  const aim = useRef({ x: -0.25, y: 0 })

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  // Project the model with the current motion and write it to the DOM.
  const draw = useRef(() => {})
  draw.current = () => {
    const { model: m, size: sz } = live.current
    const st = motion.current
    if (!sz.w) return
    const hx = sz.w / 2
    const hy = sz.h / 2
    const cS = Math.cos(st.spin)
    const sS = Math.sin(st.spin)
    const cX = Math.cos(st.rx)
    const sX = Math.sin(st.rx)
    const cY = Math.cos(st.ry)
    const sY = Math.sin(st.ry)
    const breathe = 1 + Math.sin(st.t * 0.9) * 0.008
    const spokeCount = m.angles.length
    const sincePluck = st.t - st.pluckAt
    const pluck = sincePluck < 2.5 ? 30 * Math.exp(-sincePluck * 3) * Math.sin(sincePluck * 24) : 0

    // z offset of a point on spoke k at plane radius d: a slow silk ripple
    // plus a decaying pluck around the hovered strand.
    const zAt = (k: number, d: number) => {
      const a = m.angles[k]
      let z = (reduced ? 0 : 7) * (d / m.r) * Math.sin(st.t * 1.25 + d * 0.018 + a * 2)
      if (pluck && st.pluckSpoke >= 0) {
        const di = Math.min(Math.abs(k - st.pluckSpoke), spokeCount - Math.abs(k - st.pluckSpoke))
        z += pluck * Math.exp(-(di * di) / 1.1) * Math.min(1, d / m.r)
      }
      return z
    }
    const P = { x: 0, y: 0, k: 1 }
    const project = (x: number, y: number, z: number) => {
      const px = (x * cS - y * sS) * breathe * st.sc
      const py = (x * sS + y * cS) * breathe * st.sc
      const y1 = py * cX - z * sX
      const z1 = py * sX + z * cX
      const x2 = px * cY + z1 * sY
      const z2 = -px * sY + z1 * cY + st.depth
      const k = FOCAL / (FOCAL + z2)
      P.x = hx + x2 * k
      P.y = hy + y1 * k
      P.k = k
      return P
    }
    const at = (k: number, d: number) => {
      const a = m.angles[k]
      return project(Math.cos(a) * d, Math.sin(a) * d, zAt(k, d))
    }
    const f1 = (n: number) => n.toFixed(1)
    const shade = (k: number) => Math.max(0.35, Math.min(1.3, 1 + (k - 1) * 3))

    const e = els.current
    for (let k = 0; k < spokeCount; k++) {
      const path = e.spokes[k]
      if (!path) continue
      const a = at(k, 0)
      const ax = a.x
      const ay = a.y
      const b = at(k, m.r)
      const bx = b.x
      const by = b.y
      const bk = b.k
      const c = at(k, m.reach)
      path.setAttribute('d', `M${f1(ax)} ${f1(ay)}L${f1(bx)} ${f1(by)}L${f1(c.x)} ${f1(c.y)}`)
      path.style.opacity = shade(bk).toFixed(2)
    }
    m.rings.forEach((f, ri) => {
      const path = e.rings[ri]
      if (!path) return
      const d = m.r * f
      let str = ''
      let kSum = 0
      for (let k = 0; k <= spokeCount; k++) {
        const kk = k % spokeCount
        const p = at(kk, d)
        const px = p.x
        const py = p.y
        kSum += p.k
        if (k === 0) {
          str = `M${f1(px)} ${f1(py)}`
          continue
        }
        // Sagging control point: the chord's midpoint pulled toward the hub.
        const a0 = m.angles[(kk - 1 + spokeCount) % spokeCount]
        const a1 = k === spokeCount ? m.angles[0] + 2 * Math.PI : m.angles[kk]
        const mid = (a0 + a1) / 2
        const chord = 2 * d * Math.sin((a1 - a0) / 2)
        const cd = d * Math.cos((a1 - a0) / 2) - chord * 0.16
        const cz = (zAt((kk - 1 + spokeCount) % spokeCount, d) + zAt(kk, d)) / 2
        const q = project(Math.cos(mid) * cd, Math.sin(mid) * cd, cz)
        str += `Q${f1(q.x)} ${f1(q.y)} ${f1(px)} ${f1(py)}`
      }
      path.setAttribute('d', str)
      path.style.opacity = shade(kSum / (spokeCount + 1)).toFixed(2)
    })
    if (e.hub) {
      const h = at(0, 0)
      e.hub.setAttribute('cx', f1(h.x))
      e.hub.setAttribute('cy', f1(h.y))
      e.hub.setAttribute('r', f1(6 * h.k))
    }
    m.nodeSpoke.forEach((k, i) => {
      const li = e.labels[i]
      if (!li) return
      const p = at(k, m.r)
      const s = Math.max(0.82, Math.min(1.18, p.k))
      li.style.transform = `translate3d(${f1(p.x)}px, ${f1(p.y)}px, 0) scale(${s.toFixed(3)})`
      li.style.zIndex = String(Math.round(p.k * 100))
    })
  }

  // Pointer: the web leans toward wherever the cursor is on the page,
  // relative to the stage's centre.
  useEffect(() => {
    if (reduced) return
    const onMove = (ev: PointerEvent) => {
      const el = box.current
      if (!el || ev.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      aim.current.x = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)))
      aim.current.y = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  // The frame loop runs only while the stage is on screen.
  useEffect(() => {
    const el = box.current
    if (!el) return
    if (reduced) {
      draw.current()
      return
    }
    let running = false
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000
      const st = motion.current
      st.t += dt
      const k = 1 - Math.exp(-dt / 0.35)
      const tx = BASE_TILT - aim.current.y * 0.34 + Math.sin(st.t * 0.27 + 1) * 0.05
      const ty = aim.current.x * 0.42 + Math.sin(st.t * 0.35) * 0.08
      st.rx += (tx - st.rx) * k
      st.ry += (ty - st.ry) * k
      draw.current()
    }
    const io = new IntersectionObserver(([entry]) => {
      const on = entry.isIntersecting
      if (on && !running) gsap.ticker.add(tick)
      if (!on && running) gsap.ticker.remove(tick)
      running = on
    })
    io.observe(el)
    return () => {
      io.disconnect()
      if (running) gsap.ticker.remove(tick)
    }
  }, [reduced])

  // Redraw immediately when the model changes (size or group), so the first
  // frame is right even before the loop ticks.
  useLayoutEffect(() => {
    draw.current()
  }, [model, size])

  // Spin a fresh web in from depth each time a group is chosen.
  useLayoutEffect(() => {
    const el = box.current
    if (!el || !size.w || reduced || !armed) return
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(motion.current, { spin: -1.15, depth: 620, sc: 0.78 }, { spin: 0, depth: 0, sc: 1, duration: 1.5, ease: 'expo.out' }, 0)
        .fromTo('.orb-spoke', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.out', stagger: 0.025 }, 0.05)
        .fromTo('.orb-ring', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power1.inOut', stagger: 0.06 }, 0.2)
        .fromTo('.orb-label', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, 0.45)
    }, el)
    return () => ctx.revert()
  }, [category.name, size.w, size.h, reduced, armed])

  const pluck = (i: number) => {
    setHover(i)
    motion.current.pluckSpoke = model.nodeSpoke[i]
    motion.current.pluckAt = motion.current.t
  }

  els.current.spokes.length = model.angles.length
  els.current.rings.length = model.rings.length
  els.current.labels.length = category.items.length

  return (
    <div
      ref={box}
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className={cn('skill-stage relative h-full min-h-[480px] outline-none', (armed || reduced) && 'is-armed')}
    >
      {size.w > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0" width={size.w} height={size.h} fill="none">
            <defs>
              <radialGradient id={`${maskId}g`} gradientUnits="userSpaceOnUse" cx={size.w / 2} cy={size.h / 2} r={model.r * 1.8}>
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.6" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id={`${maskId}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={size.w} height={size.h}>
                <rect width={size.w} height={size.h} fill={`url(#${maskId}g)`} />
              </mask>
            </defs>
            <g mask={`url(#${maskId}m)`}>
              {model.rings.map((_, i) => (
                <path
                  key={`${category.name}r${i}`}
                  ref={(node) => {
                    els.current.rings[i] = node
                  }}
                  className="orb-strand orb-ring"
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
              {model.angles.map((_, k) => (
                <path
                  key={`${category.name}s${k}`}
                  ref={(node) => {
                    els.current.spokes[k] = node
                  }}
                  className={cn(
                    'orb-strand orb-spoke',
                    model.spokeNode[k] >= 0 && 'is-skill',
                    model.spokeNode[k] >= 0 && model.spokeNode[k] === hover && 'is-hot',
                  )}
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
            </g>
            <circle
              ref={(node) => {
                els.current.hub = node
              }}
              className="orb-hub"
              r={6}
            />
          </svg>
          <ul aria-label={`${category.name} skills`}>
            {category.items.map((item, i) => (
              <li
                key={`${category.name}-${item.name}`}
                ref={(node) => {
                  els.current.labels[i] = node
                }}
                className={cn('orb-pin absolute left-0 top-0', `is-${model.places[i]}`)}
                onPointerEnter={() => pluck(i)}
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
            ))}
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

  const hoverTimer = useRef<number>()
  const choose = (i: number) => {
    if (!touched.current) window.dispatchEvent(new CustomEvent('skills:engaged'))
    touched.current = true
    setArmed(true)
    setActive(i)
  }
  // Hover selects only when the mouse itself moves onto a group, never when
  // the page scrolls a group under a resting cursor (browsers fire enter
  // events for that too), so scrolling past the list doesn't flick through it.
  const lastPointer = useRef({ x: -1, y: -1 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      lastPointer.current.x = e.clientX
      lastPointer.current.y = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.clearTimeout(hoverTimer.current)
    }
  }, [])
  const hoverChoose = (i: number, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || i === active) return
    const still = e.type === 'pointerenter'
      ? e.clientX === lastPointer.current.x && e.clientY === lastPointer.current.y
      : !e.movementX && !e.movementY
    if (still) return
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => choose(i), 110)
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
        <SectionHeading label="skills" title="What I build with" />

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
                    onPointerEnter={(e) => hoverChoose(i, e)}
                    onPointerMove={(e) => hoverChoose(i, e)}
                    onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
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
