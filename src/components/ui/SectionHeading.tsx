import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import Reveal from './Reveal'

interface SectionHeadingProps {
  title: ReactNode
  /** Optional lead paragraph, stacked under the title. */
  lead?: ReactNode
  /** Code-comment style eyebrow, e.g. "about" renders as "// about". */
  label?: string
  className?: string
}

export default function SectionHeading({ title, lead, label, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {label && (
        <Reveal>
          <p className="mono-label text-accent">
            <span className="text-steel-500">// </span>
            {label}
          </p>
        </Reveal>
      )}
      <Reveal delay={label ? 0.05 : 0}>
        <h2 className="display mt-4 text-2xl text-steel-100 sm:text-3xl md:text-[2.4rem]">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-steel-300 md:text-lg">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}
