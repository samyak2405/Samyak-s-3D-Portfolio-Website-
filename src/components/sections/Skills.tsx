import { useRef } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import WebBackdrop from '../fx/WebBackdrop'
import SectionHeading from '../ui/SectionHeading'

/**
 * Skills as an index strung on a single web thread.
 *
 * Each category is a row: its name set large in the display face, its skills in
 * plain text beside it. A silk thread runs down the left edge and spins out as
 * you scroll; its tip sits on a fixed line in the viewport, and each row's knot
 * lights red as the thread reaches it. Hovering a row brings it forward and
 * quiets the rest. Recently added skills carry a small suit-blue dot.
 *
 * Under reduced motion the thread is simply there, fully spun, with every knot
 * lit.
 */

// Where the thread's tip sits in the viewport while it spins (from the top).
const TIP_LINE = '62%'

export default function Skills() {
  const { skills } = usePortfolio()
  const list = useRef<HTMLDivElement>(null)

  const scope = useGsap<HTMLElement>(({ gsap, ScrollTrigger, reduced }) => {
    const root = list.current
    if (!root) return
    const rows = gsap.utils.toArray<HTMLElement>('.skill-row', root)
    if (reduced) {
      gsap.set('.skill-thread-spun', { scaleY: 1 })
      rows.forEach((row) => row.classList.add('is-reached'))
      return
    }

    gsap.fromTo(
      '.skill-thread-spun',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: `top ${TIP_LINE}`, end: `bottom ${TIP_LINE}`, scrub: 0.4 },
      },
    )
    // A knot lights once the thread's tip has reached its row (and goes dark
    // again if you scroll back above it).
    rows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: `top+=24 ${TIP_LINE}`,
        end: 'max',
        toggleClass: { targets: row, className: 'is-reached' },
      })
    })
  })

  return (
    <section ref={scope} id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <WebBackdrop corner="tr" seed={17} strength={0.08} size="min(85vw, 640px)" />
      <div className="container-edge relative">
        <SectionHeading
          label="skills"
          title="What I build with"
          lead="Grouped by where each tool lives in a system. A blue dot marks what I've picked up most recently."
        />

        <div ref={list} className="skill-index relative mt-14 md:mt-20">
          {/* The thread: a faint guide for the whole run, and the spun silk on top. */}
          <span aria-hidden className="skill-thread" />
          <span aria-hidden className="skill-thread skill-thread-spun" />

          <dl>
            {skills.categories.map((category) => (
              <div
                key={category.name}
                className="skill-row grid gap-x-10 gap-y-3 border-b border-white/[0.06] py-7 pl-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] md:py-9 md:pl-14"
              >
                <dt className="font-display text-[2.1rem] font-bold leading-[0.95] text-[color:var(--moonlight)] md:text-[2.75rem]">
                  {category.name}
                </dt>
                <dd className="flex flex-wrap items-baseline gap-x-7 gap-y-2 self-center text-lg text-steel-300 md:text-xl">
                  {category.items.map((item) => (
                    <span key={item.name} className="whitespace-nowrap">
                      {item.name}
                      {item.recent && (
                        <>
                          <span aria-hidden className="skill-new" />
                          <span className="sr-only"> (recent)</span>
                        </>
                      )}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
