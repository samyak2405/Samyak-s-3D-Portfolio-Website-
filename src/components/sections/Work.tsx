import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { Project } from '../../types/portfolio'
import { cn } from '../../lib/cn'
import Character from '../ui/Character'
import Marquee from '../ui/Marquee'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

function ProjectCard({ project, open, onToggle }: { project: Project; open: boolean; onToggle: () => void }) {
  const repoHref = project.repo || project.link
  const stop = (e: React.MouseEvent) => e.stopPropagation()

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
      aria-label={`${project.title}. Activate for details.`}
      className="group/card relative flex h-[300px] w-[300px] shrink-0 cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-white/10 p-6 text-left glass shadow-soft transition-shadow duration-300 hover:border-accent/40 sm:w-[340px]"
    >
      {/* Face: title + subtitle */}
      <span className="relative z-0 flex h-full flex-col">
        <span className="font-mono text-xs text-steel-400">
          {project.role} · {project.year}
        </span>
        <span className="mt-3 block text-xl font-semibold text-steel-100">{project.title}</span>
        <span className="mt-2 block text-sm text-accent">{project.subtitle}</span>
        <span className="mt-auto pt-4 font-mono text-xs text-steel-500 transition-opacity duration-200 group-hover/card:opacity-0">
          {open ? 'tap to close' : 'hover · tap for details'}
        </span>
      </span>

      {/* Details overlay */}
      <span
        className={cn(
          'absolute inset-0 z-10 flex flex-col rounded-2xl bg-ink-2 p-6 transition-opacity duration-300',
          'group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus/card:pointer-events-auto group-focus/card:opacity-100',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <span className="block text-base font-semibold text-steel-100">{project.title}</span>
        <span className="mt-2 block flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-steel-300 [scrollbar-width:thin]">
          {project.description}
        </span>
        {project.stack.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-hairline bg-white/[0.02] px-2 py-0.5 font-mono text-[0.7rem] text-steel-300"
              >
                {tech}
              </span>
            ))}
          </span>
        )}
        {(project.demo || repoHref) && (
          <span className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
            {project.demo && (
              <a
                href={project.demo}
                onClick={stop}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-strong"
              >
                View demo <ArrowUpRight size={14} />
              </a>
            )}
            {repoHref && (
              <a
                href={repoHref}
                onClick={stop}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-steel-100 hover:text-accent"
              >
                Repository <ArrowUpRight size={14} />
              </a>
            )}
          </span>
        )}
      </span>
    </div>
  )
}

export default function Work() {
  const { projects } = usePortfolio()
  const [openId, setOpenId] = useState<string | null>(null)

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null
  const sorted = [...projects].sort((a, b) => Number(b.highlight) - Number(a.highlight))

  return (
    <section id="work" className="relative overflow-hidden border-t border-hairline py-24 md:py-32">
      <div aria-hidden className="grid-bg absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 42% at 25% 30%, rgba(77,139,255,0.10), transparent 70%), radial-gradient(38% 44% at 80% 80%, rgba(198,92,255,0.10), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <SectionHeading
            label="work"
            title="Things I've built on the side"
            lead="Projects where I get to own the whole stack. Correctness, concurrency, and scale, usually all at once. Hover or tap a card for the details."
          />
          <Reveal className="hidden justify-center lg:flex lg:justify-end">
            <Character
              pose="projects-thinking"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, thinking with a hand on his chin"
              className="h-[42vh] w-auto lg:h-[54vh]"
            />
          </Reveal>
        </div>
      </div>

      {/* Full-bleed moving carousel */}
      <div className="relative mt-12">
        <Marquee
          ariaLabel="Projects"
          durationSec={52}
          paused={openId !== null}
          items={sorted}
          renderItem={(project) => (
            <ProjectCard
              project={project}
              open={openId === project.id}
              onToggle={() => setOpenId((cur) => (cur === project.id ? null : project.id))}
            />
          )}
        />
      </div>
    </section>
  )
}
