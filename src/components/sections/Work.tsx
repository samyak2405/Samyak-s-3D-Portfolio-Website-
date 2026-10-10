import { ArrowUpRight } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { Project } from '../../types/portfolio'
import Carousel3D from '../ui/Carousel3D'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

export default function Work() {
  const { projects } = usePortfolio()

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null
  const sorted = [...projects].sort((a, b) => Number(b.highlight) - Number(a.highlight))

  const face = (project: Project) => (
    <>
      <span className="text-xs text-steel-400">
        {project.role}, {project.year}
      </span>
      <span className="mt-3 block text-xl font-semibold text-steel-100">{project.title}</span>
      <span className="mt-2 block text-sm text-accent">{project.subtitle}</span>
      <span className="mt-auto pt-4 text-xs text-steel-500">Open for details</span>
    </>
  )

  const detail = (project: Project) => {
    const repoHref = project.repo || project.link
    return (
      <div>
        <p className="text-xs text-steel-400">
          {project.role}, {project.year}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-steel-100">{project.title}</h3>
        <p className="mt-1 text-sm text-accent">{project.subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-steel-300 [text-wrap:pretty]">
          {project.description}
        </p>
        {project.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-steel-300"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
        {(project.demo || repoHref) && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm text-accent hover:text-accent-strong"
              >
                View demo <ArrowUpRight size={16} />
              </a>
            )}
            {repoHref && (
              <a
                href={repoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm text-steel-100 hover:text-accent"
              >
                View repository <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="work" className="relative overflow-hidden border-t border-hairline py-24 md:py-32">
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
          lead="Projects where I get to own the whole stack. Correctness, concurrency, and scale, usually all at once. Click a card for the details."
        />

        <div className="mt-8">
          <Carousel3D
            ariaLabel="Projects"
            items={sorted}
            getId={(p) => p.id}
            cardClass={() => 'border-white/10'}
            renderFace={face}
            renderDetail={detail}
            durationSec={32}
          />
        </div>
      </div>
    </section>
  )
}
