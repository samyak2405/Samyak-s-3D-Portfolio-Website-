import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Stagger delay, seconds. Pass an index * step from the caller. */
  delay?: number
  /** Vertical travel distance on enter, px. */
  y?: number
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Enter-on-scroll wrapper. Motion is motivated: it reveals content in reading
 * order as each block arrives. Collapses to an instant, static render under
 * prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, y = 22, ...rest }: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
