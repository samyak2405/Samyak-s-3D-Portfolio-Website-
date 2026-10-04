import { usePortfolio } from '../../hooks/usePortfolio'
import { cn } from '../../lib/cn'
import Character from '../ui/Character'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

/** Skill pill. The name is always visible (no hover required); recent/growth
 * skills get the amber treatment. Hover/focus adds a subtle lift only. */
function chipClass(recent?: boolean) {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200',
    'hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
    recent
      ? 'border-amber/40 bg-amber-soft text-amber-strong hover:shadow-glow-magenta'
      : 'border-hairline bg-ink-3 text-steel-200 hover:border-accent/50 hover:text-accent hover:shadow-glow-blue',
  )
}

export default function Skills() {
  const { skills } = usePortfolio()

  return (
    <section id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        <SectionHeading
          label="skills"
          title="The stack, grouped"
          lead="The tools I build with, organized by where they live in a system. The magenta tags are what I've picked up most recently."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          {/* The guide presents the stack to its right. */}
          <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <Character
              pose="skills-gesturing"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, presenting his skills"
              className="w-full max-w-[16rem] lg:max-w-sm"
            />
          </Reveal>

          {/* Permanently-labeled grouped chips */}
          <div className="order-1 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:order-2">
            {skills.categories.map((category, i) => (
              <Reveal key={category.name} delay={(i % 2) * 0.06} className="border-t border-hairline pt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-steel-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  {category.name}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <span className={chipClass(item.recent)}>
                        <span className="font-mono">{item.name}</span>
                        {item.recent && (
                          <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-70">
                            new
                          </span>
                        )}
                      </span>
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
