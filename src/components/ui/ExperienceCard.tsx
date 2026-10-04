import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Experience } from '../../types/portfolio'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A role as an expandable "play card". The face (role, company, dates, location,
 * one-line summary) is always visible; clicking or pressing Enter/Space expands
 * it to reveal the detail bullets. Hover adds a subtle lift on desktop; tap is
 * the real trigger so it works on touch. Height animation flattens under
 * reduced-motion.
 */
export default function ExperienceCard({
  exp,
  defaultOpen = false,
}: {
  exp: Experience
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const reduce = useReducedMotion()
  const panelId = `exp-${exp.company}-${exp.period}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase()

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="group overflow-hidden rounded-2xl border border-hairline bg-ink-3 shadow-soft transition-colors duration-300 hover:border-accent/40"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-5 p-5 text-left md:p-6"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-accent">{exp.period}</span>
            {exp.active && (
              <span className="rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 font-mono text-[0.6rem] tracking-wider text-accent">
                NOW
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-steel-100">
            {exp.role}
            <span className="font-normal text-steel-400"> · {exp.company}</span>
          </h3>
          <p className="mt-1 text-sm text-steel-400">{exp.location}</p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-steel-300">{exp.summary}</p>
        </div>

        <span
          aria-hidden
          className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline-strong text-steel-300 transition-colors duration-300 group-hover:border-accent/60"
        >
          <Plus size={18} className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
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
            <ul className="space-y-3 border-t border-hairline px-5 pb-6 pt-5 md:px-6">
              {exp.highlights.map((h, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-steel-300">
                  <span aria-hidden className="mt-2 h-px w-3.5 shrink-0 bg-accent/60" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
