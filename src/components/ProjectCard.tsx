import { useState } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import type { Project } from '../types/portfolio'

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [imgOk, setImgOk] = useState(project.image.trim() !== '')
  const hasLink = project.link.trim() !== ''

  return (
    <article
      className="card-dark sticky overflow-hidden"
      style={{ top: `${96 + index * 16}px` }}
    >
      <div className="grid gap-0 md:grid-cols-2">
        {/* Visual */}
        <div className="relative min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#1b1b1f,#0c0c0c)] md:min-h-[360px]">
          {imgOk ? (
            <img
              src={project.image}
              alt={project.title}
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center p-8">
              <span className="text-chrome text-center text-4xl font-bold sm:text-5xl">
                {project.title}
              </span>
            </div>
          )}
          {project.highlight && (
            <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <Star size={12} className="fill-[#f97316] text-[#f97316]" />
              Featured
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col p-8 md:p-10">
          <div className="flex items-center gap-3">
            <span className="mono-pill">{project.year}</span>
            <span className="text-sm text-[#8b8f96]">{project.role}</span>
          </div>

          <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">{project.title}</h3>
          <p className="mt-1 text-[#a855f7]">{project.subtitle}</p>

          <p className="mt-5 leading-relaxed text-[#b9bcc2]">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#b9bcc2]"
              >
                {tech}
              </span>
            ))}
          </div>

          {hasLink && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent mt-8 inline-flex w-fit items-center gap-2 px-5 py-2.5 text-sm"
            >
              Live Project <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
