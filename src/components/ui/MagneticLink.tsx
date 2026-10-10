import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { cn } from '../../lib/cn'

interface MagneticLinkProps {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  external?: boolean
  className?: string
  'aria-label'?: string
}

const VARIANTS = {
  // Gamer/coder: solid electric-blue primary that glows on hover, neon-outlined
  // secondary.
  primary:
    'bg-accent-deep text-white font-medium shadow-soft hover:shadow-glow-primary',
  ghost:
    'border border-hairline-strong text-steel-100 hover:border-accent/70 hover:text-accent hover:shadow-glow-primary',
} as const

/**
 * Primary / ghost call-to-action link with a subtle magnetic pull toward the
 * cursor. Pointer tracking runs through motion values and springs, never React
 * state, so it stays smooth and never re-renders the tree. Disabled entirely
 * under prefers-reduced-motion.
 */
export default function MagneticLink({
  href,
  children,
  variant = 'primary',
  external = false,
  className,
  ...rest
}: MagneticLinkProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.28)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.28)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm',
        'transition-colors duration-300 will-change-transform',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.a>
  )
}
