import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, type DependencyList } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

interface GsapCtx {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  scope: HTMLElement
  reduced: boolean
}

/**
 * Runs GSAP setup inside a scoped gsap.context (auto-reverted on cleanup) tied
 * to the returned ref. `reduced` is passed through so callers can skip motion
 * and render the static end-state under prefers-reduced-motion.
 */
export function useGsap<T extends HTMLElement = HTMLElement>(
  setup: (ctx: GsapCtx) => void,
  deps: DependencyList = [],
) {
  const scope = useRef<T>(null)
  const reduced = !!useReducedMotion()

  useEffect(() => {
    const el = scope.current
    if (!el) return
    const context = gsap.context(
      () => setup({ gsap, ScrollTrigger, scope: el, reduced }),
      el,
    )
    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps])

  return scope
}
