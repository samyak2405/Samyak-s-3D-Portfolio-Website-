import { ArrowUpRight } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import Reveal from '../ui/Reveal'
import Statement from '../ui/Statement'
import TiltCard from '../ui/TiltCard'

export default function Work() {
  const { projects } = usePortfolio()

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null
  const featured = projects.find((p) => p.highlight) ?? projects[0]

  return (
    <section id="work" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        <Statement
          eyebrow="Selected Work"
          align="center"
          className="mx-auto max-w-3xl text-3xl leading-[1.12] sm:text-4xl md:text-5xl"
          segments={[
            { text: 'Built to stay correct when' },
            { text: 'money and concurrency', className: 'text-dim display-italic' },
            { text: 'are both on the line.' },
          ]}
        />

        {/* The project's architecture, presented as the piece's "media". */}
        <Reveal delay={0.1} className="mt-20">
          <TiltCard
            glare
            max={4}
            className="relative overflow-hidden rounded-2xl border border-hairline bg-ink-2 p-8 edge-highlight md:p-14"
          >
            <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="mono-label">System · {featured.id}</span>
                <span className="font-mono text-xs text-steel-500">{featured.year}</span>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.stack.map((tech) => (
                  <div key={tech} className="flex items-center gap-3">
                    <span aria-hidden className="h-px w-4 shrink-0 bg-accent/60" />
                    <span className="font-mono text-sm text-steel-200">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </Reveal>

        {/* Editorial name row: serif title left, live link right. */}
        <div className="mt-8 flex flex-col gap-6 border-t border-hairline pt-7 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <h3 className="display text-4xl text-steel-100 md:text-5xl">{featured.title}</h3>
            <p className="mt-2 text-steel-300">{featured.subtitle}</p>
          </Reveal>
          {featured.link && (
            <Reveal delay={0.08}>
              <a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-steel-100"
              >
                <span className="border-b border-steel-500 pb-0.5 transition-colors group-hover:border-accent">
                  View repository
                </span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl leading-relaxed text-steel-300 [text-wrap:pretty]">
            {featured.description}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
