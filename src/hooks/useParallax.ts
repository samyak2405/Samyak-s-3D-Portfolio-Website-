import { useEffect, useRef, useState } from 'react'

export interface ParallaxState {
  /** Normalized pointer offset from center, range roughly [-1, 1]. */
  x: number
  y: number
}

/**
 * Tracks the pointer relative to the viewport center and returns a smoothed,
 * normalized offset. Layers consume this at different multipliers so motion
 * feels alive (head slow, glow faster) rather than like one rigid block.
 *
 * Respects prefers-reduced-motion by staying at rest.
 */
export function useParallax(smoothing = 0.08): ParallaxState {
  const [state, setState] = useState<ParallaxState>({ x: 0, y: 0 })
  const target = useRef<ParallaxState>({ x: 0, y: 0 })
  const current = useRef<ParallaxState>({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const onMove = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    const tick = () => {
      current.current = {
        x: current.current.x + (target.current.x - current.current.x) * smoothing,
        y: current.current.y + (target.current.y - current.current.y) * smoothing,
      }
      setState({ x: current.current.x, y: current.current.y })
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [smoothing])

  return state
}
