import { useReducedMotion } from 'framer-motion'
import { Component, lazy, Suspense, useRef, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { useMediaQuery } from '../hooks/useMediaQuery'

const HeroCanvas = lazy(() => import('./HeroCanvas'))

/** Matches the scene's palette so there is no flash or layout shift while the
 * WebGL bundle loads, and so the hero still reads if WebGL is unavailable. */
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 dot-grid"
      style={{
        background:
          'radial-gradient(55% 55% at 72% 40%, rgba(221,132,32,0.10), transparent 70%), radial-gradient(50% 50% at 40% 55%, rgba(43,76,140,0.08), transparent 70%)',
      }}
    />
  )
}

/** Keeps a broken WebGL context from taking the page down with it. */
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <StaticBackdrop />
    return this.props.children
  }
}

/**
 * Hosts the hero's 3D scene: lazy-loaded, paused when off screen, and replaced by
 * a static backdrop under reduced-motion or on any WebGL failure.
 */
export default function CanvasMount() {
  const reduce = useReducedMotion()
  // Skip WebGL entirely on small/touch screens and for reduced-motion: the
  // static backdrop reads the same and keeps three.js off the critical path.
  const isSmall = useMediaQuery('(max-width: 767px)')
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, '200px')

  if (reduce || isSmall) {
    return (
      <div className="absolute inset-0">
        <StaticBackdrop />
      </div>
    )
  }

  return (
    <div ref={ref} className="absolute inset-0">
      <StaticBackdrop />
      <CanvasBoundary>
        <Suspense fallback={null}>
          <HeroCanvas reduced={false} active={inView} />
        </Suspense>
      </CanvasBoundary>
    </div>
  )
}
