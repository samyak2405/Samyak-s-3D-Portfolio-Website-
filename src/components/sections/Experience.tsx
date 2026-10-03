import { usePortfolio } from '../../hooks/usePortfolio'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function Experience() {
  const { experience, education } = usePortfolio()

  return (
    <section
      id="experience"
      className="relative border-t border-hairline bg-ink-2/40 py-24 md:py-32"
    >
      <div className="container-edge">
        <SectionHeading
          title="What I've built at PayU"
          lead="Payment, card, and authentication systems on a fintech platform serving 10+ enterprise clients, designed and owned from first principles to production."
        />

        <div className="mt-16 border-l border-hairline">
          {experience.map((exp, i) => (
            <Reveal
              key={`${exp.company}-${exp.period}`}
              delay={i * 0.05}
              className="relative pb-16 pl-7 last:pb-0 md:pl-12"
            >
              {/* Timeline marker */}
              <span
                aria-hidden
                className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-ink"
              />

              <div className="grid gap-5 md:grid-cols-[190px_1fr] md:gap-10">
                <div>
                  <p className="font-mono text-xs text-accent">{exp.period}</p>
                  <p className="mt-1.5 text-sm text-steel-400">{exp.location}</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-steel-100">
                    {exp.role}
                    <span className="text-steel-400"> · {exp.company}</span>
                  </h3>
                  <p className="mt-3 max-w-[65ch] leading-relaxed text-steel-300">
                    {exp.summary}
                  </p>

                  <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
                    {exp.highlights.map((h, hi) => (
                      <li
                        key={hi}
                        className="flex gap-4 py-4 text-sm leading-relaxed text-steel-300"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-px w-4 shrink-0 bg-accent/50"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Education — compact, under the timeline */}
        <div className="mt-8 grid gap-6 border-t border-hairline pt-10 sm:grid-cols-2">
          {education.map((edu, i) => (
            <Reveal key={edu.degree} delay={i * 0.06}>
              <p className="font-mono text-xs text-steel-500">{edu.period}</p>
              <h4 className="mt-2 font-medium text-steel-100">{edu.degree}</h4>
              <p className="mt-1 text-sm text-steel-400">{edu.institution}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
