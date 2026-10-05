import { useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { SkillCategory } from '../../types/portfolio'
import { cn } from '../../lib/cn'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

// Category -> accent hue. Each family gets its own colour so the field reads as
// one labelled set (decoded by the legend), harmonised at a similar lightness.
const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#4D8BFF',
  'Backend & Frameworks': '#38BDF8',
  'AI / ML': '#A78BFA',
  Databases: '#2DD4BF',
  'DevOps & Infra': '#F2B55C',
  'Distributed Systems & Domain': '#C65CFF',
  'Messaging & Observability': '#FB7185',
}
const FALLBACK_COLOR = '#4D8BFF'

const SYMBOLS: Record<string, string> = {
  Java: 'Jv', TypeScript: 'Ts', Python: 'Py', 'Spring Boot': 'Sb', 'REST APIs': 'Re',
  gRPC: 'gR', Microservices: 'Ms', 'Multi-Tenancy': 'Mt', RAG: 'Rg', 'LLM Integration': 'Ll',
  'AI Service Design': 'Ai', PostgreSQL: 'Pg', 'Azure SQL': 'Az', MySQL: 'My', Redis: 'Rd',
  Elasticsearch: 'Es', Docker: 'Dk', Kubernetes: 'K8', 'CI/CD': 'Ci', AWS: 'Aw', Jenkins: 'Je',
  Payments: 'Pm', 'Card Systems': 'Cs', 'HSM Integration': 'Hs', 'Multi-Tenant Auth': 'Ta',
  'Distributed Systems Design': 'Ds', Kafka: 'Kf', RabbitMQ: 'Rb', 'ELK Stack': 'Ek', Grafana: 'Gf',
}

const SIZE = 'clamp(3.75rem, 8vw, 5.25rem)'

function symbolFor(name: string) {
  if (SYMBOLS[name]) return SYMBOLS[name]
  const letters = name.replace(/[^a-zA-Z]/g, '')
  return (letters[0] ?? '?').toUpperCase() + (letters[1] ?? '').toLowerCase()
}
function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

type Element = { name: string; recent?: boolean; category: string; color: string; symbol: string }
type Atom = { cx: number; cy: number; vx: number; vy: number; r: number }

function atomStyle(color: string): CSSProperties {
  return {
    width: SIZE,
    height: SIZE,
    '--cat': color,
    '--cat-dim': rgba(color, 0.4),
    '--cat-glow': rgba(color, 0.45),
  } as CSSProperties
}

function AtomInner({ el }: { el: Element }) {
  return (
    <>
      {el.recent && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber shadow-glow-magenta"
        />
      )}
      <span
        className="pointer-events-none font-mono text-xl font-semibold leading-none md:text-2xl"
        style={{ color: el.color }}
      >
        {el.symbol}
      </span>
      <span className="pointer-events-none mt-0.5 max-w-[88%] truncate font-mono text-[0.5rem] leading-none text-steel-400">
        {el.name}
      </span>
    </>
  )
}

/** Physics playground: atoms drift, collide, flee the cursor, and can be dragged. */
function AtomField({ elements }: { elements: Element[] }) {
  const container = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const atoms = useRef<Atom[]>([])
  const pointer = useRef({ x: 0, y: 0, active: false })
  const dragged = useRef(-1)

  useLayoutEffect(() => {
    const box = container.current
    const first = nodes.current[0]
    if (!box || !first) return
    const n = elements.length
    let w = box.clientWidth
    let h = box.clientHeight
    let r = first.offsetWidth / 2

    const cols = Math.max(1, Math.floor(w / (r * 2.3)))
    atoms.current = elements.map((_, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const ang = Math.random() * Math.PI * 2
      const sp = 0.3 + Math.random() * 0.5
      return {
        cx: clamp((col + 0.5) * (w / cols) + (Math.random() - 0.5) * r, r, w - r),
        cy: clamp(r + 6 + row * (r * 2.2) + (Math.random() - 0.5) * r, r, h - r),
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        r,
      }
    })

    const write = () => {
      for (let i = 0; i < n; i++) {
        const a = atoms.current[i]
        const el = nodes.current[i]
        if (el) el.style.transform = `translate3d(${a.cx - a.r}px, ${a.cy - a.r}px, 0)`
      }
    }
    write()

    let raf = 0
    let running = true
    const step = () => {
      const A = atoms.current
      const p = pointer.current
      for (let i = 0; i < n; i++) {
        if (i === dragged.current) continue
        const a = A[i]
        if (p.active && dragged.current === -1) {
          const dx = a.cx - p.x
          const dy = a.cy - p.y
          const d2 = dx * dx + dy * dy
          const RR = 130
          if (d2 < RR * RR && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = (1 - d / RR) * 0.9
            a.vx += (dx / d) * f
            a.vy += (dy / d) * f
          }
        }
        a.cx += a.vx
        a.cy += a.vy
        a.vx *= 0.992
        a.vy *= 0.992
        const sp = Math.hypot(a.vx, a.vy)
        if (sp < 0.12) {
          const ang = Math.random() * Math.PI * 2
          a.vx += Math.cos(ang) * 0.08
          a.vy += Math.sin(ang) * 0.08
        } else if (sp > 4.5) {
          a.vx *= 4.5 / sp
          a.vy *= 4.5 / sp
        }
        if (a.cx < a.r) { a.cx = a.r; a.vx = Math.abs(a.vx) }
        else if (a.cx > w - a.r) { a.cx = w - a.r; a.vx = -Math.abs(a.vx) }
        if (a.cy < a.r) { a.cy = a.r; a.vy = Math.abs(a.vy) }
        else if (a.cy > h - a.r) { a.cy = h - a.r; a.vy = -Math.abs(a.vy) }
      }
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = A[i]
          const b = A[j]
          const dx = b.cx - a.cx
          const dy = b.cy - a.cy
          const dist = Math.hypot(dx, dy)
          const min = a.r + b.r
          if (dist > 0 && dist < min) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = min - dist
            const aFree = i !== dragged.current
            const bFree = j !== dragged.current
            if (aFree && bFree) {
              a.cx -= (nx * overlap) / 2; a.cy -= (ny * overlap) / 2
              b.cx += (nx * overlap) / 2; b.cy += (ny * overlap) / 2
            } else if (aFree) { a.cx -= nx * overlap; a.cy -= ny * overlap }
            else if (bFree) { b.cx += nx * overlap; b.cy += ny * overlap }
            const avn = a.vx * nx + a.vy * ny
            const bvn = b.vx * nx + b.vy * ny
            if (aFree) { a.vx += (bvn - avn) * nx; a.vy += (bvn - avn) * ny }
            if (bFree) { b.vx += (avn - bvn) * nx; b.vy += (avn - bvn) * ny }
          }
        }
      }
      write()
      if (running) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    const local = (e: globalThis.PointerEvent) => {
      const rect = box.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMove = (e: globalThis.PointerEvent) => {
      const l = local(e)
      const inside = l.x >= 0 && l.x <= w && l.y >= 0 && l.y <= h
      pointer.current = { x: l.x, y: l.y, active: inside || dragged.current !== -1 }
      if (dragged.current !== -1) {
        const a = atoms.current[dragged.current]
        const px = a.cx
        const py = a.cy
        a.cx = clamp(l.x, a.r, w - a.r)
        a.cy = clamp(l.y, a.r, h - a.r)
        a.vx = a.cx - px
        a.vy = a.cy - py
      }
    }
    const onUp = () => { dragged.current = -1 }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    // Size the bounds from the container's real width, and re-clamp on resize /
    // rotation so no atom is ever left outside.
    const ro = new ResizeObserver(() => {
      w = box.clientWidth
      h = box.clientHeight
      r = (nodes.current[0]?.offsetWidth ?? r * 2) / 2
      for (const a of atoms.current) {
        a.r = r
        a.cx = clamp(a.cx, a.r, w - a.r)
        a.cy = clamp(a.cy, a.r, h - a.r)
      }
    })
    ro.observe(box)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) { running = true; raf = requestAnimationFrame(step) }
        else if (!entry.isIntersecting) { running = false; cancelAnimationFrame(raf) }
      },
      { threshold: 0 },
    )
    io.observe(box)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      ro.disconnect()
      io.disconnect()
    }
  }, [elements])

  const onAtomDown = (i: number) => (e: PointerEvent) => {
    dragged.current = i
    pointer.current.active = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  return (
    <div ref={container} aria-hidden className="relative mt-6 h-[64vh] min-h-[420px] w-full">
      {elements.map((el, i) => (
        <div
          key={`${el.category}-${el.name}`}
          ref={(node) => { nodes.current[i] = node }}
          onPointerDown={onAtomDown(i)}
          title={`${el.name} · ${el.category}`}
          style={atomStyle(el.color)}
          className="atom absolute left-0 top-0 flex flex-col items-center justify-center rounded-full text-center"
        >
          <AtomInner el={el} />
        </div>
      ))}
    </div>
  )
}

/** Plain grouped rows of chips — the default on mobile and under reduced-motion. */
function SkillsList({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2">
      {categories.map((category) => {
        const color = CATEGORY_COLORS[category.name] ?? FALLBACK_COLOR
        return (
          <Reveal key={category.name} className="border-t border-hairline pt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-steel-100">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${rgba(color, 0.55)}` }}
              />
              {category.name}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li key={item.name}>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border bg-ink-2 px-3 py-1.5 font-mono text-sm',
                      item.recent ? 'text-amber-strong' : 'text-steel-200',
                    )}
                    style={{ borderColor: rgba(color, item.recent ? 0.5 : 0.28) }}
                  >
                    {item.name}
                    {item.recent && (
                      <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-amber">
                        new
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function Skills() {
  const { skills } = usePortfolio()
  const reduce = useReducedMotion()

  const elements = useMemo<Element[]>(
    () =>
      skills.categories.flatMap((category) =>
        category.items.map((item) => ({
          name: item.name,
          recent: item.recent,
          category: category.name,
          color: CATEGORY_COLORS[category.name] ?? FALLBACK_COLOR,
          symbol: symbolFor(item.name),
        })),
      ),
    [skills],
  )

  // Default to the calm list on mobile and under reduced-motion; the physics
  // playground ("atoms") is opt-in there and the default on desktop.
  const [view, setView] = useState<'atoms' | 'list'>(() => {
    if (typeof window === 'undefined') return 'list'
    return window.matchMedia('(min-width: 768px)').matches ? 'atoms' : 'list'
  })
  const activeView = reduce ? 'list' : view

  return (
    <section id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        <SectionHeading
          label="skills"
          title="The periodic table of my stack"
          lead="Every tool I build with, grouped by where it lives in a system. The magenta-tagged skills are what I've picked up most recently."
        />

        {/* View toggle + (atoms) legend */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          {!reduce && (
            <div
              role="group"
              aria-label="Skills view"
              className="inline-flex rounded-full border border-hairline p-1 font-mono text-xs"
            >
              {(['atoms', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    'min-h-[36px] rounded-full px-4 transition-colors',
                    view === v ? 'bg-accent-deep text-white' : 'text-steel-400 hover:text-steel-200',
                  )}
                >
                  {v === 'atoms' ? 'Atoms' : 'List'}
                </button>
              ))}
            </div>
          )}
          {activeView === 'atoms' && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
              {skills.categories.map((category) => {
                const color = CATEGORY_COLORS[category.name] ?? FALLBACK_COLOR
                return (
                  <li key={category.name} className="flex items-center gap-2 font-mono text-xs text-steel-400">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${rgba(color, 0.55)}` }}
                    />
                    {category.name}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {activeView === 'atoms' ? (
          <AtomField elements={elements} />
        ) : (
          <SkillsList categories={skills.categories} />
        )}

        {/* Accessible, crawlable list of the same content */}
        <ul className="sr-only">
          {skills.categories.map((category) => (
            <li key={category.name}>
              {category.name}: {category.items.map((item) => item.name).join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
