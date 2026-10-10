import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/cn'

interface TiltProps {
  children: ReactNode
  /** Maximum tilt in degrees at the card's edge. */
  max?: number
  /** How far the card lifts toward the viewer while tilted (px). */
  lift?: number
  className?: string
}

/**
 * Pointer-driven 3D tilt: the card leans toward the cursor in perspective, lifts
 * a few pixels, and a soft glare follows the pointer across its surface. It only
 * answers a mouse (no touch tilt) and stays flat under reduced motion.
 */
export default function Tilt({ children, max = 9, lift = 14, className }: TiltProps) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = outer.current
    const card = inner.current
    if (!el || !card) return
    const mm = gsap.matchMedia()
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      const z = gsap.quickTo(card, 'z', { duration: 0.6, ease: 'power3.out' })

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry((px - 0.5) * 2 * max)
        rx(-(py - 0.5) * 2 * max)
        z(lift)
        card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
        card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
        card.dataset.tilting = 'true'
      }
      const leave = () => {
        rx(0)
        ry(0)
        z(0)
        delete card.dataset.tilting
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
        gsap.set(card, { clearProps: 'transform' })
      }
    })
    return () => mm.revert()
  }, [max, lift])

  return (
    <div ref={outer} className={cn('tilt [perspective:1000px]', className)}>
      <div ref={inner} className="tilt-card relative h-full [transform-style:preserve-3d]">
        {children}
        <span aria-hidden className="tilt-glare" />
      </div>
    </div>
  )
}
