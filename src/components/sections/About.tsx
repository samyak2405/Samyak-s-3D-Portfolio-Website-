import { usePortfolio } from '../../hooks/usePortfolio'
import Counter from '../ui/Counter'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function About() {
  const { profile, metrics } = usePortfolio()

  return (
    <section id="about" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        <SectionHeading
          title="I own whole systems, not tickets."
          lead={profile.bio}
        />

        {/* Resume-backed outcomes. No card boxes — the numbers breathe. */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-hairline pt-10 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <Reveal key={metric.label} delay={i * 0.06}>
              <Counter
                value={metric.value}
                className="block font-mono text-4xl font-medium text-accent md:text-5xl"
              />
              <p className="mt-3 text-sm font-medium text-steel-100">{metric.label}</p>
              <p className="mt-1 text-sm leading-snug text-steel-400">{metric.context}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
