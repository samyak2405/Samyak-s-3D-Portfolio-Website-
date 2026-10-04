import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import Character from '../ui/Character'
import ExperienceCard from '../ui/ExperienceCard'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

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
            label="experience"
            title="Where I've built things"
            lead="From fintech at PayU to Walmart today: backend, distributed, and now AI systems, designed and owned from first principles to production."
          />
          <Reveal className="flex justify-center lg:justify-end">
            <Character
              pose="work-laptop"
              alt="Samyak Moon, a 3D cartoon gamer-coder character coding on a laptop with headphones on"
              className="h-[46vh] w-auto lg:h-[58vh]"
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
              className="relative pb-6 pl-7 last:pb-0 md:pl-10"
            >
              {/* Timeline marker — the current role gets a filled, pulsing node */}
              {exp.active ? (
                <span aria-hidden className="absolute -left-[7.5px] top-6 h-3.5 w-3.5">
                  {!reduce && (
                    <span className="absolute inset-0 rounded-full bg-accent/60 animate-pulse-ring" />
                  )}
                  <span className="absolute inset-0 rounded-full bg-accent shadow-[0_0_14px_rgba(43,76,140,0.5)]" />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="absolute -left-[6.5px] top-6 h-3 w-3 rounded-full border-2 border-accent bg-ink"
                />
              )}

              <ExperienceCard exp={exp} defaultOpen={i === 0} />
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
