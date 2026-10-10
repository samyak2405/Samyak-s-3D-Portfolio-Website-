import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import WebBackdrop from '../fx/WebBackdrop'
import Counter from '../ui/Counter'

export default function About() {
  const { profile, metrics } = usePortfolio()

  const scope = useGsap<HTMLElement>(({ gsap, reduced }) => {
    if (reduced) return
    const st = (trigger: string) => ({
      scrollTrigger: { trigger, start: 'top 80%' },
    })
    gsap.from('.about-reveal', {
      y: 26,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      ...st('.about-copy'),
    })
    gsap.utils.toArray<HTMLElement>('.metric').forEach((el) => {
      gsap.from(el, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
    })
  })

  return (
    <section ref={scope} id="about" className="relative py-24 md:py-32">
      <WebBackdrop corner="bl" seed={9} size="min(85vw, 640px)" />
      <div className="container-edge relative">
        <div className="about-copy max-w-3xl">
          <p className="about-reveal mono-label text-accent">
            <span className="text-steel-500">// </span>about
          </p>
          <h2 className="about-reveal display h-fluid-2 mt-4 text-steel-100">
            I own whole systems, not tickets.
          </h2>
          <p className="about-reveal mt-6 text-base leading-relaxed text-steel-300 md:text-lg [text-wrap:pretty]">
            {profile.bio}
          </p>
        </div>

        {/* Resume-backed outcomes */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric">
              <Counter
                value={metric.value}
                className="block font-mono text-3xl font-semibold text-amber md:text-4xl"
              />
              <p className="mt-2 text-sm font-semibold text-steel-100">{metric.label}</p>
              <p className="mt-1 text-xs leading-snug text-steel-400">{metric.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
