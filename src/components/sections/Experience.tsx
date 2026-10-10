import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import { useMatch } from '../../hooks/useMatch'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import type { Experience as Role } from '../../types/portfolio'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

/**
 * Experience: the same thread-and-detail pattern as Skills.
 *
 * Left, a thread runs through each role (newest first) and on into education;
 * each role's knot lights as the thread reaches it. Desktop (lg+): the roles
 * are a vertical tab list (hover, click or arrow keys) and the chosen role's
 * file comes to the front of a 3D deck on the right, with the other roles
 * stacked behind it in depth, their tops peeking out like files in a drawer;
 * a peeking file can be clicked to bring it forward, and the deck leans gently
 * toward the cursor (less while you're reading it). Below lg a role opens
 * in place under its name.
 */

const TIP_LINE = '62%'
const WIDE = '(min-width: 1024px)'
const PEEK = 88 // room above the front file for the ones stacked behind it

/** Notes-to-self in the data ("TODO(samyak): …") never reach the page. */
const clean = (s: string) => s.replace(/\s*TODO\([^)]*\)[\s\S]*$/, '').trim()

/** Metrics inside a highlight ("85%", "10K+", "10+") read a touch brighter. */
function emphasize(text: string): ReactNode[] {
  return text.split(/(\d+(?:[.,]\d+)?(?:%|K\+|\+))/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="exp-metric">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

/** A few strands in the file's corner, so each one belongs to the web. */
function CornerWeb() {
  return (
    <svg aria-hidden className="exp-corner" viewBox="0 0 120 120" fill="none">
      <path d="M120 0L20 0M120 0L0 40M120 0L30 90M120 0L80 120M120 0L120 100" />
      <path d="M96 0Q100 8 98 9Q104 18 110 20Q114 26 120 24" />
      <path d="M70 0Q78 14 76 18Q88 34 98 36Q106 48 120 48" />
      <path d="M44 0Q56 22 52 28Q70 52 84 54Q94 70 120 72" />
    </svg>
  )
}

function RoleBody({ role }: { role: Role }) {
  const highlights = role.highlights.map(clean).filter(Boolean)
  return (
    <div className="exp-body relative">
      <div className="exp-reveal flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="tabular-nums text-steel-300">{role.period}</span>
        <span className="text-steel-500">{role.location}</span>
        {role.active && <span className="exp-now">Now</span>}
      </div>
      <h3 className="exp-reveal mt-4 font-display text-[2.1rem] font-bold leading-[0.98] text-[color:var(--moonlight)] md:text-[2.5rem]">
        {role.role}
      </h3>
      <p className="exp-reveal mt-1.5 text-lg text-steel-300">{role.company}</p>
      <p className="exp-reveal mt-5 max-w-[60ch] text-[1.02rem] leading-relaxed text-steel-200 [text-wrap:pretty]">
        {clean(role.summary)}
      </p>
      <ul className="mt-6 space-y-3.5 border-t border-white/[0.07] pt-6">
        {highlights.map((h, i) => (
          <li key={i} className="exp-reveal flex gap-3.5 text-[0.95rem] leading-relaxed text-steel-300 [text-wrap:pretty]">
            <span aria-hidden className="exp-bullet" />
            <span>{emphasize(h)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The role's line in the list: period, company, title. */
function RoleHead({ role }: { role: Role }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="flex items-center gap-2.5 text-xs tabular-nums text-steel-400">
        {role.period}
        {role.active && <span className="exp-now is-small">Now</span>}
      </span>
      <span className="skill-name mt-2 font-display text-[1.6rem] font-bold leading-none">{role.company}</span>
      <span className="mt-1.5 text-sm text-steel-400">{role.role}</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Desktop: a 3D deck of role files
// ---------------------------------------------------------------------------

interface DeckProps {
  id: string
  labelledBy: string
  roles: Role[]
  active: number
  onPick: (i: number) => void
  reduced: boolean
  armed: boolean
}

// Depth slot for a file d places behind the front one. With the perspective
// origin at the top of the deck, files further back rise and narrow.
const slot = (d: number) => ({
  y: -d * 40,
  z: -d * 120,
  rotationZ: d * 0.6,
})

function RoleDeck({ id, labelledBy, roles, active, onPick, reduced, armed }: DeckProps) {
  const stage = useRef<HTMLDivElement>(null)
  const rig = useRef<HTMLDivElement>(null)
  const cards = useRef<Array<HTMLDivElement | null>>([])
  const [tallest, setTallest] = useState(0)
  const laidOut = useRef(false)
  const shown = useRef(active)
  const n = roles.length

  // The stage is as tall as the longest file, plus room for the stack above.
  // Files are measured by their content, since files behind the front one are
  // trimmed to its height.
  useLayoutEffect(() => {
    const els = cards.current.filter(Boolean) as HTMLDivElement[]
    const measure = () => setTallest(Math.max(0, ...els.map((e) => e.scrollHeight)))
    const ro = new ResizeObserver(measure)
    els.forEach((e) => {
      const body = e.querySelector('.exp-body')
      if (body) ro.observe(body)
    })
    measure()
    return () => ro.disconnect()
  }, [n])

  // Lay the deck out around the chosen role. The incoming file tips up into
  // place and its contents rise in; the others settle into the fan.
  useLayoutEffect(() => {
    const els = cards.current
    const animate = laidOut.current && armed && !reduced
    const changed = shown.current !== active
    // Files behind the front one take its height, so a long file never shows
    // below a short one.
    const frontH = els[active]?.scrollHeight ?? 0
    els.forEach((el, i) => {
      if (!el) return
      const d = (i - active + n) % n
      const s = { ...slot(d), height: d === 0 ? el.scrollHeight : frontH }
      if (!animate) {
        gsap.set(el, { ...s, rotationX: 0 })
      } else if (d === 0 && changed) {
        gsap.fromTo(el, { rotationX: 14 }, { ...s, rotationX: 0, duration: 1.1, ease: 'expo.out', overwrite: 'auto' })
        gsap.fromTo(
          el.querySelectorAll('.exp-reveal'),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.045, delay: 0.12, overwrite: 'auto' },
        )
      } else {
        gsap.to(el, { ...s, rotationX: 0, duration: 0.95, ease: 'expo.out', overwrite: 'auto' })
      }
    })
    laidOut.current = true
    shown.current = active
  }, [active, n, armed, reduced, tallest])

  // First arrival: the files fly in from depth, back to front.
  useLayoutEffect(() => {
    if (!armed || reduced) return
    const els = cards.current.filter(Boolean) as HTMLDivElement[]
    const order = [...els].sort((a, b) => Number(b.dataset.depth) - Number(a.dataset.depth))
    const tl = gsap.from(order, { z: -700, opacity: 0, rotationX: 24, duration: 1.3, ease: 'expo.out', stagger: 0.12 })
    return () => {
      tl.progress(1).kill()
    }
    // Only the first time the deck is armed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed])

  // The deck leans toward the cursor while it moves, then settles flat once
  // the mouse rests, so the text is always level when you're reading it.
  useEffect(() => {
    const el = stage.current
    const r = rig.current
    if (!el || !r || reduced) return
    const rx = gsap.quickTo(r, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    let rest: number | undefined
    const settle = () => {
      gsap.to(r, { rotationX: 0, rotationY: 0, duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' })
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const b = el.getBoundingClientRect()
      if (b.bottom < 0 || b.top > window.innerHeight) return
      const x = Math.max(-1, Math.min(1, (e.clientX - (b.left + b.width / 2)) / (b.width / 2)))
      const y = Math.max(-1, Math.min(1, (e.clientY - (b.top + b.height / 2)) / (b.height / 2)))
      const over = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom
      const k = over ? 0.5 : 1
      ry(x * 5 * k)
      rx(-y * 3.5 * k)
      window.clearTimeout(rest)
      rest = window.setTimeout(settle, 650)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.clearTimeout(rest)
    }
  }, [reduced])

  return (
    <div
      ref={stage}
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className={cn('exp-stage relative outline-none', (armed || reduced) && 'is-armed')}
      style={{ height: tallest ? tallest + PEEK + 8 : undefined }}
    >
      <div ref={rig} className="exp-rig absolute inset-0">
        {roles.map((role, i) => {
          const d = (i - active + n) % n
          const front = d === 0
          return (
            <div
              key={`${role.company}-${role.period}`}
              ref={(el) => {
                cards.current[i] = el
              }}
              data-depth={d}
              data-front={front || undefined}
              data-current={role.active || undefined}
              aria-hidden={!front}
              onClick={front ? undefined : () => onPick(i)}
              className="exp-card panel"
              style={{ top: PEEK }}
            >
              <CornerWeb />
              <RoleBody role={role} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Below lg: a role opens in place under its name
// ---------------------------------------------------------------------------

function RoleRow({ role, open, onToggle }: { role: Role; open: boolean; onToggle: () => void }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className="skill-row" data-open={open || undefined}>
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="skill-head relative flex w-full items-center py-4 pl-10 pr-2 text-left md:pl-14"
        >
          <span aria-hidden className="skill-knot" />
          <RoleHead role={role} />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className="exp-fold"
        {...(!open ? { inert: '' } : {})}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="exp-card is-flat panel mb-5 ml-10 rounded-2xl p-5 md:ml-14 md:p-7">
            <CornerWeb />
            <RoleBody role={role} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export default function Experience() {
  const { experience: roles, education } = usePortfolio()
  const list = useRef<HTMLDivElement>(null)
  const wide = useMatch(WIDE)
  const ids = useId().replace(/:/g, '')
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(reduced ? 0 : null)
  const [armed, setArmed] = useState(reduced)
  const touched = useRef(false)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const hoverTimer = useRef<number>()
  const lastPointer = useRef({ x: -1, y: -1 })

  const engage = () => {
    if (!touched.current) window.dispatchEvent(new CustomEvent('spidey:engaged', { detail: { id: 'experience' } }))
    touched.current = true
  }
  const choose = (i: number) => {
    engage()
    setArmed(true)
    setActive(i)
  }
  const toggle = (i: number) => {
    engage()
    setOpen((cur) => (cur === i ? null : i))
  }

  // Hover only counts when the mouse itself moves onto a role, not when the
  // page scrolls one under a resting cursor.
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
    const still =
      e.type === 'pointerenter'
        ? e.clientX === lastPointer.current.x && e.clientY === lastPointer.current.y
        : !e.movementX && !e.movementY
    if (still) return
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => choose(i), 120)
  }

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = roles.length - 1
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

  // Height changes when a role opens in place: re-measure every trigger.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 700)
    return () => window.clearTimeout(t)
  }, [open, wide])

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
        setArmed(true)
        if (!touched.current) setOpen((cur) => (cur === null ? 0 : cur))
      },
    })
  }, [wide])

  return (
    <section
      ref={scope}
      id="experience"
      className="relative overflow-hidden border-t border-hairline bg-ink-2/40 py-24 md:py-32"
    >
      <div aria-hidden className="halftone halftone-blue absolute inset-0 opacity-70" />
      <WebBackdrop corner="bl" seed={14} size="min(90vw, 720px)" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(38% 42% at 72% 38%, rgba(255,59,74,0.10), transparent 70%), radial-gradient(40% 44% at 18% 82%, rgba(77,139,255,0.08), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <SectionHeading
          label="experience"
          title="Where I've built things"
          lead="From fintech at PayU to Walmart today: backend, distributed, and now AI systems, designed and owned from first principles to production."
        />

        <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.45fr)] lg:items-start lg:gap-12">
          <div ref={list} className="skill-index relative lg:mt-[72px]">
            <span aria-hidden className="skill-thread" />
            <span aria-hidden className="skill-thread skill-thread-spun" />

            <div
              {...(wide
                ? { role: 'tablist', 'aria-orientation': 'vertical' as const, 'aria-label': 'Roles', onKeyDown: onTabKey }
                : {})}
            >
              {roles.map((role, i) =>
                wide ? (
                  <div
                    key={`${role.company}-${role.period}`}
                    role="presentation"
                    className="skill-row"
                    data-active={active === i || undefined}
                  >
                    <button
                      ref={(el) => {
                        tabs.current[i] = el
                      }}
                      type="button"
                      role="tab"
                      id={`${ids}-tab-${i}`}
                      aria-selected={active === i}
                      aria-controls={`${ids}-deck`}
                      tabIndex={active === i ? 0 : -1}
                      onClick={() => choose(i)}
                      onPointerEnter={(e) => hoverChoose(i, e)}
                      onPointerMove={(e) => hoverChoose(i, e)}
                      onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                      className="skill-head relative flex w-full items-center py-4 pl-14 pr-2 text-left"
                    >
                      <span aria-hidden className="skill-knot" />
                      <RoleHead role={role} />
                    </button>
                  </div>
                ) : (
                  <RoleRow
                    key={`${role.company}-${role.period}`}
                    role={role}
                    open={open === i}
                    onToggle={() => toggle(i)}
                  />
                ),
              )}
            </div>

            {/* Education continues the same thread, quieter. */}
            <h3 className="exp-edu-title pl-10 pt-8 font-display text-[1.15rem] font-bold text-steel-400 md:pl-14">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.degree} className="skill-row exp-edu relative py-3.5 pl-10 md:pl-14">
                <span aria-hidden className="skill-knot" />
                <p className="text-xs tabular-nums text-steel-500">{edu.period}</p>
                <p className="mt-1.5 font-display text-[1.25rem] font-bold leading-none text-steel-200">{edu.degree}</p>
                <p className="mt-1 text-sm text-steel-500">{edu.institution}</p>
              </div>
            ))}
          </div>

          {wide && (
            <RoleDeck
              id={`${ids}-deck`}
              labelledBy={`${ids}-tab-${active}`}
              roles={roles}
              active={active}
              onPick={choose}
              reduced={reduced}
              armed={armed}
            />
          )}
        </div>
      </div>
    </section>
  )
}
