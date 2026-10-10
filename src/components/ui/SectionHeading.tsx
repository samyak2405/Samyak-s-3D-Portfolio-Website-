import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import Reveal from './Reveal'

interface SectionHeadingProps {
  title: ReactNode
  /** Optional lead paragraph, stacked under the title. */
  lead?: ReactNode
  /** Section name. Kept for callers/anchors; not rendered — the heading says it. */
  label?: string
  className?: string
}

export default function SectionHeading({ title, lead, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <Reveal>
        <h2 className="display h-fluid-2">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-steel-300 md:text-lg">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}
