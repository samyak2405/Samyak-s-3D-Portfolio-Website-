import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import CanvasMount from '../../three/CanvasMount'
import MagneticLink from '../ui/MagneticLink'
import { cn } from '../../lib/cn'

const EASE = [0.16, 1, 0.3, 1] as const

// Serif headline split into words so each can rise in sequence. Emphasis comes
// from brightness + italic, with a single warm word as Samyak's signature.
const HEADLINE: Array<{ text: string; cls?: string }>[] = [
  [{ text: 'I' }, { text: 'build' }, { text: 'the' }, { text: 'systems' }],
  [
    { text: 'that', cls: 'display-italic text-dim' },
    { text: 'move', cls: 'display-italic text-dim' },
    { text: 'money.', cls: 'display-italic text-accent' },
  ],
]

export default function Hero() {
  const { profile } = usePortfolio()
  const reduce = useReducedMotion()

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  let wordIndex = 0

  return (
    <section id="hero" ref={heroRef} className="relative min-h-[100dvh] overflow-hidden">
      <CanvasMount />

      {/* Scrims: keep the serif legible over the scene, fade base at the bottom. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent md:to-ink/5"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-edge relative flex min-h-[100dvh] flex-col justify-between pb-24 pt-32 md:pb-28"
      >
        {/* Top: eyebrow + serif headline */}
        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mono-label text-steel-300"
          >
            {profile.role}
          </motion.p>

          <h1 className="display mt-7 text-5xl text-steel-100 sm:text-7xl lg:text-[7.5rem]">
            {HEADLINE.map((line, li) => (
              <span key={li} className="flex flex-wrap gap-x-[0.28em]">
                {line.map((word) => {
                  const delay = 0.2 + wordIndex++ * 0.07
                  return (
                    <motion.span
                      key={word.text}
                      initial={reduce ? false : { opacity: 0, y: '0.4em' }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay, ease: EASE }}
                      className={cn('inline-block', word.cls)}
                    >
                      {word.text}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>
        </div>

        {/* Bottom: CTAs (left) + justified blurb (right) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex flex-wrap items-center gap-3">
            <MagneticLink href="#work" variant="primary">
              View my work
              <ArrowDown size={16} />
            </MagneticLink>
            <MagneticLink href={`mailto:${profile.social.email}`} variant="ghost">
              Get in touch
              <ArrowUpRight size={16} />
            </MagneticLink>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-steel-300 md:text-right [text-wrap:pretty]">
            {profile.tagline}
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
