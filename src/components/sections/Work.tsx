import { ArrowUpRight } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import MagneticLink from '../ui/MagneticLink'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import TiltCard from '../ui/TiltCard'

export default function Work() {
  const { projects } = usePortfolio()

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null
  const featured = projects.find((p) => p.highlight) ?? projects[0]

  return (
    <section
      id="work"
      className="relative border-t border-hairline bg-ink-2/40 py-24 md:py-32"
    >
      <div className="container-edge">
        <SectionHeading title="Selected work" />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          {/* Editorial side */}
          <Reveal>
            <p className="font-mono text-xs text-steel-500">
              {featured.role} · {featured.year}
            </p>
            <h3 className="display mt-4 text-3xl text-steel-100 md:text-5xl">
              {featured.title}
            </h3>
            <p className="mt-3 text-lg text-accent">{featured.subtitle}</p>
            <p className="mt-6 max-w-[56ch] leading-relaxed text-steel-300">
              {featured.description}
            </p>
            {featured.link && (
              <div className="mt-8">
                <MagneticLink href={featured.link} variant="ghost" external>
                  View repository
                  <ArrowUpRight size={16} />
                </MagneticLink>
              </div>
            )}
          </Reveal>

          {/* Architecture side — the real stack, rendered as a system manifest */}
          <Reveal delay={0.1}>
            <TiltCard className="relative overflow-hidden rounded-2xl border border-hairline bg-ink-3 p-7 edge-highlight md:p-9">
              <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="mono-label">System · {featured.id}</span>
                  <span className="font-mono text-xs text-steel-500">{featured.year}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
                  {featured.stack.map((tech) => (
                    <div key={tech} className="flex items-center gap-3">
                      <span aria-hidden className="h-px w-3.5 shrink-0 bg-accent/60" />
                      <span className="font-mono text-sm text-steel-200">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
