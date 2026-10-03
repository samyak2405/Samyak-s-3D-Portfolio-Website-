import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. */
  max?: number
}

/**
 * Pointer-tracking 3D tilt. The rotation is derived from motion values and
 * springs (never React state) so it never re-renders the tree, and it flattens
 * completely under prefers-reduced-motion.
 */
export default function TiltCard({ children, className, max = 7 }: TiltCardProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 18 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 18 })

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}
