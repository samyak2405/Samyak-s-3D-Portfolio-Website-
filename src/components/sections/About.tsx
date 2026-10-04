import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import Character from '../ui/Character'
import Counter from '../ui/Counter'

export default function About() {
  const { profile, metrics } = usePortfolio()

  const scope = useGsap<HTMLElement>(({ gsap, reduced }) => {
    if (reduced) return
    const st = (trigger: string) => ({
      scrollTrigger: { trigger, start: 'top 80%' },
    })
    gsap.from('.about-character', {
      x: -40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      ...st('.about-character'),
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
      <div className="container-edge">
        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          {/* Character */}
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <Character
              pose="about-arms-crossed"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, standing confidently with arms crossed"
              className="about-character h-[48vh] w-auto lg:h-[62vh]"
            />
          </div>

          {/* Copy */}
          <div className="about-copy order-1 max-w-xl lg:order-2">
            <p className="about-reveal mono-label text-accent">About</p>
            <h2 className="about-reveal display mt-4 text-3xl text-steel-100 sm:text-4xl md:text-5xl">
              I own whole systems, not tickets.
            </h2>
            <p className="about-reveal mt-6 text-base leading-relaxed text-steel-300 md:text-lg [text-wrap:pretty]">
              {profile.bio}
            </p>

            {/* Resume-backed outcomes */}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-4">
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
        </div>
      </div>
    </section>
  )
}
