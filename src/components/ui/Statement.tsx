import { motion, useReducedMotion } from 'framer-motion'
import { Fragment } from 'react'
import { cn } from '../../lib/cn'

const EASE = [0.16, 1, 0.3, 1] as const

export interface StatementSegment {
  text: string
  /** Extra classes for this phrase, e.g. 'text-dim' or 'display-italic text-accent'. */
  className?: string
}

interface StatementProps {
  segments: StatementSegment[]
  /** Small grotesk label above the statement. */
  eyebrow?: string
  /** Classes applied to the serif line (size, alignment, color). */
  className?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * A large editorial serif statement that reveals word by word as it enters the
 * viewport, using brightness contrast (bright vs dimmed phrases) rather than a
 * color pop for emphasis. Collapses to a static block under reduced-motion.
 */
export default function Statement({ segments, eyebrow, className, align = 'center' }: StatementProps) {
  const reduce = useReducedMotion()

  const words = segments.flatMap((seg, si) =>
    seg.text.split(' ').map((w, wi) => ({ w, cls: seg.className, key: `${si}-${wi}` })),
  )

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={alignClass}>
      {eyebrow && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mono-label mb-7"
        >
          {eyebrow}
        </motion.p>
      )}
      <p className={cn('display text-steel-100', className)}>
        {words.map((word, i) => (
          <Fragment key={word.key}>
            <motion.span
              initial={reduce ? false : { opacity: 0, y: '0.4em' }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.045, ease: EASE }}
              className={cn('inline-block', word.cls)}
            >
              {word.w}
            </motion.span>{' '}
          </Fragment>
        ))}
      </p>
    </div>
  )
}
