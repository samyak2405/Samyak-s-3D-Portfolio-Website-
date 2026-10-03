import { usePortfolio } from '../../hooks/usePortfolio'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function About() {
  const { profile, metrics, skills } = usePortfolio()

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
              <p className="font-mono text-4xl font-medium text-accent md:text-5xl">
                {metric.value}
              </p>
              <p className="mt-3 text-sm font-medium text-steel-100">{metric.label}</p>
              <p className="mt-1 text-sm leading-snug text-steel-400">{metric.context}</p>
            </Reveal>
          ))}
        </div>

        {/* Toolkit — grouped, not a flat bullet list */}
        <div className="mt-20">
          <Reveal>
            <h3 className="mono-label mb-8">Toolkit</h3>
          </Reveal>
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {skills.categories.map((category, i) => (
              <Reveal
                key={category.name}
                delay={(i % 3) * 0.05}
                className="border-t border-hairline pt-5"
              >
                <h4 className="text-sm font-medium text-steel-200">{category.name}</h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1 font-mono text-xs text-steel-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
