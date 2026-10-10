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
  // Suit-red primary lit from above (inner highlight, warm drop glow); a quiet
  // frosted secondary that brightens rather than glows.
  primary:
    'bg-[linear-gradient(180deg,#e3283a_0%,#c30e25_100%)] text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_-10px_rgba(255,59,74,0.75)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_14px_34px_-10px_rgba(255,59,74,0.9)]',
  ghost:
    'border border-white/15 bg-white/[0.04] text-steel-100 backdrop-blur-md hover:border-white/35 hover:bg-white/[0.08]',
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
        'inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[0.95rem]',
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
