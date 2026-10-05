import { useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { Experience as Exp } from '../../types/portfolio'
import { cn } from '../../lib/cn'
import Marquee from '../ui/Marquee'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

function ExpCard({ exp, open, onToggle }: { exp: Exp; open: boolean; onToggle: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      aria-expanded={open}
      aria-label={`${exp.role} at ${exp.company}. Activate for details.`}
      className={cn(
        'group/card relative flex h-[300px] w-[300px] shrink-0 cursor-pointer select-none flex-col overflow-hidden rounded-2xl border p-6 text-left glass transition-shadow duration-300 sm:w-[340px]',
        exp.active
          ? 'border-accent/40 shadow-glow-blue'
          : 'border-white/10 shadow-soft hover:border-accent/40',
      )}
    >
      {exp.active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-20 h-0.5 bg-gradient-to-r from-accent via-amber to-accent"
        />
      )}

      {/* Face: role + summary */}
      <span className="relative z-0 flex h-full flex-col">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-accent">{exp.period}</span>
          {exp.active && (
            <span className="rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 font-mono text-xs tracking-wider text-accent">
              NOW
            </span>
          )}
        </span>
        <span className="mt-3 block text-lg font-semibold text-steel-100">
          {exp.role}
          <span className="font-normal text-steel-400"> · {exp.company}</span>
        </span>
        <span className="mt-1 block text-sm text-steel-400">{exp.location}</span>
        <span className="mt-4 block text-sm leading-relaxed text-steel-300 [display:-webkit-box] [overflow:hidden] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {exp.summary}
        </span>
        <span className="mt-auto pt-4 font-mono text-xs text-steel-500 transition-opacity duration-200 group-hover/card:opacity-0">
          {open ? 'tap to close' : 'hover · tap for details'}
        </span>
      </span>

      {/* Details overlay */}
      <span
        className={cn(
          'absolute inset-0 z-10 flex flex-col rounded-2xl bg-ink-2 p-6 transition-opacity duration-300',
          'group-hover/card:opacity-100 group-focus/card:opacity-100',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="block text-sm font-semibold text-steel-100">
          {exp.role}
          <span className="font-normal text-steel-400"> · {exp.company}</span>
        </span>
        <ul className="mt-4 space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {exp.highlights.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-steel-300">
              <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent/60" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </span>
    </div>
  )
}

export default function Experience() {
  const { experience, education } = usePortfolio()
  const [openId, setOpenId] = useState<string | null>(null)
  const idOf = (e: Exp) => `${e.company}-${e.period}`

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
          lead="From fintech at PayU to Walmart today: backend, distributed, and now AI systems, designed and owned from first principles to production. Hover or tap a card for the details."
        />
      </div>

      {/* Full-bleed moving carousel */}
      <div className="relative mt-12">
        <Marquee
          ariaLabel="Experience timeline"
          paused={openId !== null}
          items={experience}
          renderItem={(exp) => (
            <ExpCard
              exp={exp}
              open={openId === idOf(exp)}
              onToggle={() => setOpenId((cur) => (cur === idOf(exp) ? null : idOf(exp)))}
            />
          )}
        />
      </div>

      {/* Education — compact, under the carousel */}
      <div className="container-edge relative">
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
