import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import Reveal from './Reveal'

interface SectionHeadingProps {
  title: ReactNode
  /** Optional lead paragraph, stacked under the title (never a split header). */
  lead?: ReactNode
  /** Optional monospace index, e.g. "02". Used sparingly, not on every section. */
  index?: string
  className?: string
}

/**
 * Section title block. Title and lead are stacked vertically (the split "big
 * headline + floating corner paragraph" pattern is intentionally avoided).
 */
export default function SectionHeading({ title, lead, index, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {index && (
        <Reveal className="mb-4 flex items-center gap-3">
          <span className="mono-label">{index}</span>
          <span className="h-px w-10 bg-hairline-strong" aria-hidden />
        </Reveal>
      )}
      <Reveal delay={index ? 0.05 : 0}>
        <h2 className="display text-4xl text-steel-100 sm:text-5xl md:text-6xl">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-steel-300 md:text-lg">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}
