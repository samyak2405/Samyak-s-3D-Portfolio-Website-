import { useReducedMotion } from 'framer-motion'
import { Component, lazy, Suspense, useRef, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

const HeroCanvas = lazy(() => import('./HeroCanvas'))

/** Matches the scene's palette so there is no flash or layout shift while the
 * WebGL bundle loads, and so the hero still reads if WebGL is unavailable. */
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 blueprint-grid"
      style={{
        background:
          'radial-gradient(60% 60% at 70% 45%, rgba(230,168,75,0.10), transparent 70%), radial-gradient(50% 50% at 50% 50%, rgba(120,140,170,0.08), transparent 70%)',
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
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, '200px')

  return (
    <div ref={ref} className="absolute inset-0">
      <StaticBackdrop />
      <CanvasBoundary>
        <Suspense fallback={null}>
          <HeroCanvas reduced={!!reduce} active={inView} />
        </Suspense>
      </CanvasBoundary>
    </div>
  )
}
