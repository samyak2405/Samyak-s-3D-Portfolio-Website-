import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import type { Experience } from '../types/portfolio'

const DEFAULT_VISIBLE = 3

function ExperienceRow({ exp, index }: { exp: Experience; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = exp.highlights.length > DEFAULT_VISIBLE
  const visible = expanded ? exp.highlights : exp.highlights.slice(0, DEFAULT_VISIBLE)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 gap-6 border-t border-white/10 py-10 md:grid-cols-[auto_1fr]"
    >
      <div className="font-mono text-4xl font-bold text-white/15 md:text-5xl">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            {exp.role} <span className="text-[#6b6f76]">·</span>{' '}
            <span className="text-chrome">{exp.company}</span>
          </h3>
          <span className="mono-pill">{exp.period}</span>
        </div>

        <p className="mt-1 text-sm text-[#8b8f96]">{exp.location}</p>
        <p className="mt-4 max-w-3xl text-[#b9bcc2]">{exp.summary}</p>

        <ul className="mt-6 space-y-3">
          {visible.map((h, i) => (
            <li key={i} className="flex gap-3 text-[#b9bcc2]">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a855f7]" />
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>

        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#a855f7] transition-colors hover:text-[#ec4899]"
          >
            {expanded ? 'Show less' : `Show ${exp.highlights.length - DEFAULT_VISIBLE} more`}
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function ExperienceSection() {
  const { experience } = usePortfolio()
  if (experience.length === 0) return null

  return (
    <section id="experience" className="mx-auto max-w-content px-6 py-24 md:py-32">
      <p className="section-label mb-4">02 — Experience</p>
      <h2 className="mb-12 text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
        Where I&apos;ve <span className="text-chrome">shipped.</span>
      </h2>

      <div className="border-b border-white/10">
        {experience.map((exp, i) => (
          <ExperienceRow key={`${exp.company}-${i}`} exp={exp} index={i} />
        ))}
      </div>
    </section>
  )
}
