import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import Character from '../ui/Character'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Experience() {
  const { experience, education } = usePortfolio()
  const reduce = useReducedMotion()

  // The accent rail "draws" downward as the section scrolls through the viewport,
  // tracing the progression through time.
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 65%', 'end 85%'],
  })
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="experience"
      className="relative border-t border-hairline bg-ink-2/40 py-24 md:py-32"
    >
      <div className="container-edge">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <SectionHeading
            title="Where I've built things"
            lead="From fintech at PayU to Walmart today: payment, card, authentication, and now AI systems, designed and owned from first principles to production."
          />
          <Reveal className="flex justify-center lg:justify-end">
            <Character
              pose="work-laptop"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, working on a laptop at a desk"
              className="w-full max-w-sm lg:max-w-md"
            />
          </Reveal>
        </div>

        <div ref={railRef} className="relative mt-16 border-l border-hairline">
          {/* Accent line drawn on scroll (static full line under reduced-motion) */}
          <motion.span
            aria-hidden
            style={reduce ? undefined : { scaleY: railScale }}
            className="absolute -left-px top-0 h-full w-px origin-top bg-accent/70"
          />

          {experience.map((exp, i) => (
            <Reveal
              key={`${exp.company}-${exp.period}`}
              delay={i * 0.05}
              className="relative pb-16 pl-7 last:pb-0 md:pl-12"
            >
              {/* Timeline marker — the current role gets a filled, pulsing node */}
              {exp.active ? (
                <span aria-hidden className="absolute -left-[7.5px] top-1.5 h-3.5 w-3.5">
                  {!reduce && (
                    <span className="absolute inset-0 rounded-full bg-accent/60 animate-pulse-ring" />
                  )}
                  <span className="absolute inset-0 rounded-full bg-accent shadow-[0_0_14px_rgba(230,168,75,0.55)]" />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-ink"
                />
              )}

              <div className="grid gap-5 md:grid-cols-[190px_1fr] md:gap-10">
                <div>
                  <p className="flex items-center gap-2 font-mono text-xs text-accent">
                    {exp.period}
                    {exp.active && (
                      <span className="rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 text-[0.6rem] tracking-wider">
                        NOW
                      </span>
                    )}
                  </p>
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
                      <motion.li
                        key={hi}
                        initial={reduce ? false : { opacity: 0, x: -8 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: hi * 0.08, ease: EASE }}
                        className="group flex gap-4 py-4 text-sm leading-relaxed text-steel-300"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-px w-4 shrink-0 bg-accent/50 transition-all duration-300 group-hover:w-7 group-hover:bg-accent"
                        />
                        <span>{h}</span>
                      </motion.li>
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
              <p className="font-mono text-xs text-steel-400">{edu.period}</p>
              <h4 className="mt-2 font-medium text-steel-100">{edu.degree}</h4>
              <p className="mt-1 text-sm text-steel-400">{edu.institution}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
