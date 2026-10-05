import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { Experience as Exp } from '../../types/portfolio'
import { cn } from '../../lib/cn'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

function Slide({ exp, index, total }: { exp: Exp; index: number; total: number }) {
  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={`${exp.role} at ${exp.company} — ${index + 1} of ${total}`}
      className={cn(
        'glass relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 md:p-8',
        exp.active ? 'border-accent/40 shadow-glow-blue' : 'border-white/10 shadow-soft',
      )}
    >
      {exp.active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-amber to-accent"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-accent">{exp.period}</span>
        {exp.active && (
          <span className="rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 font-mono text-xs tracking-wider text-accent">
            NOW
          </span>
        )}
        <span className="ml-auto font-mono text-xs text-steel-500">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold text-steel-100">
        {exp.role}
        <span className="font-normal text-steel-400"> · {exp.company}</span>
      </h3>
      <p className="mt-1 text-sm text-steel-400">{exp.location}</p>
      <p className="mt-4 text-sm leading-relaxed text-steel-300">{exp.summary}</p>
      <ul className="mt-5 space-y-3 border-t border-hairline pt-5">
        {exp.highlights.map((h, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-steel-300">
            <span aria-hidden className="mt-2 h-px w-3.5 shrink-0 bg-accent/60" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Experience() {
  const { experience, education } = usePortfolio()
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const total = experience.length

  // Active slide = the one whose centre is nearest the viewport centre.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = track.getBoundingClientRect()
        const center = rect.left + rect.width / 2
        let best = 0
        let bestDist = Infinity
        slideRefs.current.forEach((s, i) => {
          if (!s) return
          const r = s.getBoundingClientRect()
          const d = Math.abs(r.left + r.width / 2 - center)
          if (d < bestDist) {
            bestDist = d
            best = i
          }
        })
        setActive(best)
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [total])

  const go = (idx: number) => {
    const i = Math.max(0, Math.min(total - 1, idx))
    slideRefs.current[i]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(active - 1)
    }
  }

  return (
    <section
      id="experience"
      className="relative overflow-hidden border-t border-hairline bg-ink-2/40 py-24 md:py-32"
    >
      <div aria-hidden className="grid-bg absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(38% 42% at 72% 28%, rgba(77,139,255,0.12), transparent 70%), radial-gradient(40% 44% at 18% 82%, rgba(198,92,255,0.10), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <SectionHeading
          label="experience"
          title="Where I've built things"
          lead="From fintech at PayU to Walmart today: backend, distributed, and now AI systems, designed and owned from first principles to production."
        />

        {/* Carousel */}
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Experience timeline"
          className="mt-12"
          onKeyDown={onKeyDown}
        >
          <div
            ref={trackRef}
            data-lenis-prevent
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {/* Leading spacer lets the first card snap to centre */}
            <div aria-hidden className="shrink-0 basis-[4%] sm:basis-[14%] lg:basis-[20%]" />
            {experience.map((exp, i) => (
              <div
                key={`${exp.company}-${exp.period}`}
                ref={(el) => {
                  slideRefs.current[i] = el
                }}
                className="flex shrink-0 snap-center basis-[88%] sm:basis-[72%] lg:basis-[58%]"
              >
                <Slide exp={exp} index={i} total={total} />
              </div>
            ))}
            <div aria-hidden className="shrink-0 basis-[4%] sm:basis-[14%] lg:basis-[20%]" />
          </div>

          {/* Controls */}
          <div className="mt-7 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous role"
              className="grid h-11 w-11 place-items-center rounded-full border border-hairline-strong text-steel-200 transition-colors hover:border-accent/60 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-hairline-strong disabled:hover:text-steel-200"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Select a role">
              {experience.map((exp, i) => (
                <button
                  key={`${exp.company}-${exp.period}`}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to ${exp.role} at ${exp.company}`}
                  aria-current={active === i}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    active === i ? 'w-6 bg-accent' : 'w-2 bg-steel-600 hover:bg-steel-400',
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === total - 1}
              aria-label="Next role"
              className="grid h-11 w-11 place-items-center rounded-full border border-hairline-strong text-steel-200 transition-colors hover:border-accent/60 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-hairline-strong disabled:hover:text-steel-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Education — compact, under the carousel */}
        <div className="mt-14 grid gap-6 border-t border-hairline pt-10 sm:grid-cols-2">
          {education.map((edu, i) => (
            <Reveal key={edu.degree} delay={i * 0.06}>
              <p className="font-mono text-xs text-steel-400">{edu.period}</p>
              <h4 className="mt-2 font-medium text-steel-100">{edu.degree}</h4>
              <p className="mt-1 text-sm text-steel-400">{edu.institution}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
