import { usePortfolio } from '../../hooks/usePortfolio'
import type { Experience as Exp } from '../../types/portfolio'
import Carousel3D from '../ui/Carousel3D'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import WebBackdrop from '../fx/WebBackdrop'

export default function Experience() {
  const { experience, education } = usePortfolio()

  const face = (exp: Exp) => (
    <>
      {exp.active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-amber to-accent"
        />
      )}
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
      <span className="mt-auto pt-4 font-mono text-xs text-steel-500">click for details</span>
    </>
  )

  const detail = (exp: Exp) => (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-accent">{exp.period}</span>
        {exp.active && (
          <span className="rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 font-mono text-xs tracking-wider text-accent">
            NOW
          </span>
        )}
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
    </div>
  )

  return (
    <section
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
            'radial-gradient(38% 42% at 72% 28%, rgba(255,59,74,0.12), transparent 70%), radial-gradient(40% 44% at 18% 82%, rgba(77,139,255,0.10), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <SectionHeading
          label="experience"
          title="Where I've built things"
          lead="From fintech at PayU to Walmart today: backend, distributed, and now AI systems, designed and owned from first principles to production. Click a card for the details."
        />

        <div className="mt-10">
          <Carousel3D
            ariaLabel="Experience timeline"
            items={experience}
            getId={(e) => `${e.company}-${e.period}`}
            cardClass={(e) =>
              e.active ? 'border-accent/40 shadow-glow-primary' : 'border-white/10'
            }
            renderFace={face}
            renderDetail={detail}
            durationSec={26}
          />
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
