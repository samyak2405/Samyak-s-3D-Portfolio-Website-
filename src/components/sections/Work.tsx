import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import { rng } from '../../lib/rng'
import type { Project } from '../../types/portfolio'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

/**
 * Work: each project is a poster hanging from a silk rail on its own thread
 * (each slot carries its piece of rail, so every row of posters has one).
 *
 * The front of a poster is the summary (what it is, my role); the back is the
 * detail (write-up, stack, links). Posters turn slowly in 3D like paper in a
 * breeze, a cursor sweeping past pushes them (spring-damped pendulums), hover
 * pulls one toward you and steadies it, and click / Enter flips it over. One
 * poster is flipped at a time; Esc or the back's button flips it home. On first
 * arrival the posters drop in on their threads.
 */

/** Notes-to-self in the data ("TODO(samyak): …") never reach the page. */
const clean = (s?: string) => (s ?? '').replace(/\s*TODO\([^)]*\)[\s\S]*$/, '').trim()

// Thread lengths (px), so the posters hang at staggered heights.
const DROPS = [30, 86, 52, 112, 40, 96]

interface Swing {
  ry: number
  rz: number
  vry: number
  vrz: number
  lift: number
  flip: number
  phase: number
  /** Wide posters (tablet two-up) turn more gently than narrow ones. */
  amp: number
}

/** A small orb web unique to each project, for the poster's top corner. */
function PosterWeb({ seed }: { seed: string }) {
  const paths = useMemo(() => {
    let h = 0
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const r = rng(h)
    const spokes = 7 + Math.floor(r() * 4)
    const rot = r() * Math.PI
    const cx = 100
    const cy = 0
    const R = 96
    const angles = Array.from({ length: spokes }, (_, k) => rot + (k * 2 * Math.PI) / spokes)
    const out: string[] = angles.map((a) => `M${cx} ${cy}L${(cx + Math.cos(a) * R).toFixed(1)} ${(cy + Math.sin(a) * R).toFixed(1)}`)
    for (let f = 0.22; f < 1; f += 0.16 + r() * 0.05) {
      const pts = angles.map((a) => [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f])
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
      for (let i = 1; i <= pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i % pts.length]
        const mx = (a[0] + b[0]) / 2
        const my = (a[1] + b[1]) / 2
        const qx = mx + (cx - mx) * 0.14
        const qy = my + (cy - my) * 0.14
        d += `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
      }
      out.push(d)
    }
    return out
  }, [seed])
  return (
    <svg aria-hidden className="poster-web" viewBox="0 0 100 100" fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <circle cx={100} cy={0} r={3.2} className="poster-web-hub" />
    </svg>
  )
}

interface PosterProps {
  project: Project
  index: number
  flipped: boolean
  onFlip: (open: boolean) => void
  register: (i: number, el: HTMLDivElement | null) => void
  onHover: (i: number, on: boolean) => void
}

function Poster({ project, index, flipped, onFlip, register, onHover }: PosterProps) {
  const id = useId().replace(/:/g, '')
  const front = useRef<HTMLButtonElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  const year = clean(project.year)
  const role = clean(project.role)
  const description = clean(project.description)
  const stack = project.stack.map(clean).filter(Boolean)
  const repo = project.repo || project.link
  const meta = [role, year].filter(Boolean)

  // Keep keyboard focus on the face that's showing.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const t = window.setTimeout(() => (flipped ? back.current : front.current)?.focus({ preventScroll: true }), 80)
    return () => window.clearTimeout(t)
  }, [flipped])

  return (
    <li
      className="poster-hang relative"
      style={{ ['--drop' as string]: `${DROPS[index % DROPS.length]}px` }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(index, true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHover(index, false)}
    >
      <span aria-hidden className="poster-thread" />
      <div className="poster-scene">
        <div
          ref={(el) => register(index, el)}
          className="poster"
          data-flipped={flipped || undefined}
          data-featured={project.highlight || undefined}
        >
          {/* Front: the summary. The whole face is the button that flips it. */}
          <button
            ref={front}
            type="button"
            aria-expanded={flipped}
            aria-controls={`${id}-back`}
            onClick={() => onFlip(true)}
            className="poster-face poster-front panel"
            {...(flipped ? { inert: '' } : {})}
          >
            <PosterWeb seed={project.id} />
            <span className="relative flex h-full flex-col text-left">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-400">
                {meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
                {project.highlight && <span className="poster-featured">Featured</span>}
              </span>
              <span className="mt-auto pt-16 font-display text-[2rem] font-bold leading-[0.95] text-[color:var(--moonlight)]">
                {project.title}
              </span>
              <span className="mt-3 text-[0.95rem] leading-snug text-steel-300 [text-wrap:pretty]">{project.subtitle}</span>
              <span className="poster-hint mt-6 flex items-center gap-2 text-xs text-steel-500">
                <RotateCcw size={13} strokeWidth={1.75} aria-hidden className="scale-x-[-1]" />
                Flip for details
              </span>
            </span>
          </button>

          {/* Back: the detail. */}
          <div
            id={`${id}-back`}
            role="region"
            aria-label={`${project.title} details`}
            className="poster-face poster-back panel"
            {...(!flipped ? { inert: '' } : {})}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[1.45rem] font-bold leading-none text-[color:var(--moonlight)]">
                {project.title}
              </h3>
              <button
                ref={back}
                type="button"
                onClick={() => onFlip(false)}
                className="poster-close grid h-8 w-8 flex-none place-items-center rounded-full border border-white/15 text-steel-300"
                aria-label={`Flip ${project.title} back`}
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <p className="mt-4 text-[0.92rem] leading-relaxed text-steel-200 [text-wrap:pretty]">
              {description || project.subtitle}
            </p>
            {!description && <p className="mt-2 text-xs text-steel-500">Full write-up coming soon.</p>}
            {stack.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
                {stack.map((tech) => (
                  <li key={tech} className="poster-chip">
                    {tech}
                  </li>
                ))}
              </ul>
            )}
            {(project.demo || repo) && (
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-5">
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="poster-link is-primary">
                    Live demo <ArrowUpRight size={15} aria-hidden />
                  </a>
                )}
                {repo && (
                  <a href={repo} target="_blank" rel="noopener noreferrer" className="poster-link">
                    Repository <ArrowUpRight size={15} aria-hidden />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Work() {
  const { projects } = usePortfolio()
  const sorted = useMemo(() => [...projects].sort((a, b) => Number(b.highlight) - Number(a.highlight)), [projects])
  const [flipped, setFlipped] = useState<number | null>(null)
  const [armed, setArmed] = useState(false)
  const posters = useRef<Array<HTMLDivElement | null>>([])
  const hovered = useRef(-1)
  const swing = useRef<Swing[]>([])
  const flippedRef = useRef<number | null>(null)
  const engaged = useRef(false)
  const grid = useRef<HTMLUListElement>(null)
  flippedRef.current = flipped

  if (swing.current.length !== sorted.length) {
    swing.current = sorted.map((_, i) => ({ ry: 0, rz: 0, vry: 0, vrz: 0, lift: 0, flip: 0, phase: i * 1.7, amp: 1 }))
  }

  const flip = (i: number, open: boolean) => {
    if (open && !engaged.current) {
      engaged.current = true
      window.dispatchEvent(new CustomEvent('spidey:engaged', { detail: { id: 'work' } }))
    }
    setFlipped(open ? i : null)
  }

  // Turn each poster to its flip angle (only one is ever over).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    swing.current.forEach((s, i) => {
      const to = flipped === i ? 180 : 0
      if (s.flip === to) return
      if (reduce) s.flip = to
      else gsap.to(s, { flip: to, duration: 1, ease: 'expo.out', overwrite: 'auto' })
    })
    if (reduce) render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped])

  const render = () => {
    swing.current.forEach((s, i) => {
      const el = posters.current[i]
      if (!el) return
      el.style.transform = `translateZ(${(s.lift * 70).toFixed(1)}px) rotateZ(${s.rz.toFixed(2)}deg) rotateY(${(s.ry + s.flip).toFixed(2)}deg)`
    })
  }

  // The swing: spring-damped pendulums with a gentle idle turn, nudged by the
  // cursor sweeping past. Runs only while the section is on screen.
  useEffect(() => {
    const root = grid.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      render()
      return
    }
    let t = 0
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000
      t += dt
      swing.current.forEach((s, i) => {
        const still = hovered.current === i || flippedRef.current === i
        const ry0 = still ? 0 : 9 * s.amp * Math.sin(t * 0.45 + s.phase)
        const rz0 = still ? 0 : 1.3 * Math.sin(t * 0.62 + s.phase * 1.3)
        const kY = still ? 70 : 7
        const kZ = still ? 70 : 12
        const cY = still ? 14 : 1.1
        const cZ = still ? 14 : 1.6
        s.vry += (-kY * (s.ry - ry0) - cY * s.vry) * dt
        s.vrz += (-kZ * (s.rz - rz0) - cZ * s.vrz) * dt
        s.ry += s.vry * dt
        s.rz += s.vrz * dt
        const lt = hovered.current === i || flippedRef.current === i ? 1 : 0
        s.lift += (lt - s.lift) * (1 - Math.exp(-dt / 0.2))
      })
      render()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !e.movementX) return
      posters.current.forEach((el, i) => {
        if (!el) return
        const b = el.getBoundingClientRect()
        const dx = Math.max(b.left - e.clientX, 0, e.clientX - b.right)
        const dy = Math.max(b.top - e.clientY, 0, e.clientY - b.bottom)
        const near = Math.exp(-(dx * dx + dy * dy) / (2 * 60 * 60))
        if (near < 0.05) return
        const s = swing.current[i]
        s.vry = Math.max(-160, Math.min(160, s.vry + e.movementX * 2.2 * near * s.amp))
        s.vrz = Math.max(-40, Math.min(40, s.vrz - e.movementX * 0.35 * near))
      })
    }
    const ro = new ResizeObserver(() => {
      posters.current.forEach((el, i) => {
        if (el && swing.current[i]) swing.current[i].amp = Math.min(1, 300 / Math.max(1, el.offsetWidth))
      })
    })
    posters.current.forEach((el) => el && ro.observe(el))
    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        gsap.ticker.add(tick)
        window.addEventListener('pointermove', onMove, { passive: true })
      }
      if (!entry.isIntersecting && running) {
        gsap.ticker.remove(tick)
        window.removeEventListener('pointermove', onMove)
      }
      running = entry.isIntersecting
    })
    io.observe(root)
    return () => {
      ro.disconnect()
      io.disconnect()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc anywhere in the section flips the open poster home.
  useEffect(() => {
    if (flipped === null) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setFlipped(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [flipped])

  // First arrival: the posters drop in on their threads.
  const scope = useGsap<HTMLElement>(({ gsap, ScrollTrigger, reduced }) => {
    if (reduced) {
      setArmed(true)
      return
    }
    ScrollTrigger.create({
      trigger: grid.current,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        setArmed(true)
        gsap.fromTo(
          '.poster-thread',
          { scaleY: 0 },
          { scaleY: 1, duration: 0.7, ease: 'power2.out', stagger: 0.09 },
        )
        gsap.fromTo(
          '.poster-scene',
          { y: -140, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)', stagger: 0.09, delay: 0.1 },
        )
      },
    })
  })

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null

  return (
    <section ref={scope} id="work" className="relative overflow-hidden border-t border-hairline py-24 md:py-32">
      <div aria-hidden className="halftone absolute inset-0 opacity-60 [--ht-at:100%_100%]" />
      <WebBackdrop corner="tl" seed={21} size="min(90vw, 760px)" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 42% at 25% 30%, rgba(255,59,74,0.10), transparent 70%), radial-gradient(38% 44% at 80% 80%, rgba(77,139,255,0.10), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <SectionHeading
          label="work"
          title="Things I've built on the side"
          lead="Projects where I get to own the whole stack. Correctness, concurrency, and scale, usually all at once."
        />

        <div className={cn('poster-wall relative mt-12 md:mt-14', armed && 'is-armed')}>
          <ul
            ref={grid}
            aria-label="Projects"
            className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {sorted.map((project, i) => (
              <Poster
                key={project.id}
                project={project}
                index={i}
                flipped={flipped === i}
                onFlip={(open) => flip(i, open)}
                register={(idx, el) => {
                  posters.current[idx] = el
                }}
                onHover={(idx, on) => {
                  hovered.current = on ? idx : hovered.current === idx ? -1 : hovered.current
                }}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
