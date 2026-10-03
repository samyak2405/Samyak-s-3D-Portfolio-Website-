import { useReducedMotion } from 'framer-motion'
import { Component, lazy, Suspense, useRef, type ReactNode } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useInView } from '../../hooks/useInView'
import { cn } from '../../lib/cn'
import type { SkillCategory } from '../../types/portfolio'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const SkillsCanvas = lazy(() => import('../../three/SkillsCanvas'))

/** Grouped text representation of the skills. Visible when motion is reduced or
 * WebGL is unavailable; rendered sr-only otherwise so the content stays in the
 * DOM for search engines and screen readers. */
function SkillsFallback({
  categories,
  className,
}: {
  categories: SkillCategory[]
  className?: string
}) {
  return (
    <div className={cn('grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {categories.map((category) => (
        <div key={category.name} className="border-t border-hairline pt-5">
          <h3 className="text-sm font-medium text-steel-200">{category.name}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {category.items.map((item) => (
              <li
                key={item.name}
                className={
                  item.recent
                    ? 'rounded-full border border-accent/40 bg-accent-dim px-3 py-1 font-mono text-xs text-accent'
                    : 'rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-steel-300'
                }
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Keeps a broken WebGL context from taking the page down with it. */
class CanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function Skills() {
  const { skills } = usePortfolio()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, '200px')

  const categories = skills.categories
  const fallback = <SkillsFallback categories={categories} />

  return (
    <section id="skills" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        <SectionHeading
          title="The stack, as a system"
          lead="The tools I build with, grouped by where they live. The brighter nodes are what I've picked up most recently."
        />

        <div ref={ref} className="relative mt-14">
          {reduce ? (
            fallback
          ) : (
            <>
              <div className="relative h-[460px] md:h-[600px]">
                <CanvasBoundary fallback={fallback}>
                  <Suspense fallback={null}>
                    <SkillsCanvas categories={categories} reduced={false} active={inView} />
                  </Suspense>
                </CanvasBoundary>
              </div>
              <Reveal>
                <p className="mono-label mt-2 text-center">Hover a node to name it</p>
              </Reveal>
              {/* Kept in the DOM for search engines and screen readers. */}
              <SkillsFallback categories={categories} className="sr-only" />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
