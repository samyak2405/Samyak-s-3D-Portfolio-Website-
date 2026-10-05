import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '../../types/portfolio'
import { asset } from '../../lib/asset'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A project as an expandable card: hook, tech tags, and hover motion by default;
 * click (or keyboard) reveals the full description and repo link. Height and
 * hover animation flatten under reduced-motion.
 */
export default function ProjectCard({
  project,
  defaultOpen = false,
}: {
  project: Project
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const reduce = useReducedMotion()
  const panelId = `project-${project.id}`
  const repoHref = project.repo || project.link
  const media = project.media || project.image
  const resolveSrc = (m: string) => (m.startsWith('http') ? m : asset(m))

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="group glass rounded-2xl border border-white/10 shadow-soft transition-all duration-300 hover:border-accent/50 hover:shadow-glow-blue"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-6 p-6 text-left md:p-9"
      >
        <div>
          <p className="font-mono text-xs text-steel-400">
            {project.role} · {project.year}
          </p>
          <h3 className="display mt-3 text-3xl text-steel-100 md:text-4xl">{project.title}</h3>
          <p className="mt-2 text-accent">{project.subtitle}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-steel-300"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <span
          aria-hidden
          className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline-strong text-steel-200 transition-colors duration-300 group-hover:border-accent/60 group-hover:text-accent"
        >
          <Plus
            size={18}
            className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-hairline px-6 pb-7 pt-6 md:px-9">
              {media &&
                (/\.(mp4|webm)$/.test(media) ? (
                  <video
                    src={resolveSrc(media)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="mb-6 w-full rounded-xl border border-hairline"
                  />
                ) : (
                  <img
                    src={resolveSrc(media)}
                    alt={`${project.title} preview`}
                    loading="lazy"
                    className="mb-6 w-full rounded-xl border border-hairline"
                  />
                ))}
              <p className="max-w-2xl leading-relaxed text-steel-300 [text-wrap:pretty]">
                {project.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex min-h-[44px] items-center gap-2 text-sm text-accent"
                  >
                    <span className="border-b border-accent/50 pb-0.5 transition-colors group-hover/link:border-accent">
                      View demo
                    </span>
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                )}
                {repoHref && (
                  <a
                    href={repoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex min-h-[44px] items-center gap-2 text-sm text-steel-100"
                  >
                    <span className="border-b border-steel-500 pb-0.5 transition-colors group-hover/link:border-accent">
                      View repository
                    </span>
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
