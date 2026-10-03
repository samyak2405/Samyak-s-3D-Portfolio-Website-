import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import CanvasMount from '../../three/CanvasMount'
import MagneticLink from '../ui/MagneticLink'

const EASE = [0.16, 1, 0.3, 1] as const

// The headline, split into words so each can rise in sequence.
const HEADLINE: Array<{ text: string; accent?: boolean }>[] = [
  [{ text: 'I' }, { text: 'build' }, { text: 'the' }, { text: 'systems' }],
  [{ text: 'that' }, { text: 'move' }, { text: 'money.', accent: true }],
]

export default function Hero() {
  const { profile } = usePortfolio()
  const reduce = useReducedMotion()

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  let wordIndex = 0

  return (
    <section id="hero" ref={heroRef} className="relative min-h-[100dvh] overflow-hidden">
      {/* Live 3D system behind the content */}
      <CanvasMount />

      {/* Left-to-right scrim keeps headline contrast over the scene (WCAG AA) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-transparent md:to-ink/10"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="container-edge relative flex min-h-[100dvh] items-center pt-24 pb-20">
        <motion.div
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
          className="max-w-2xl"
        >
          <motion.p
            {...rise(0)}
            className="mono-label flex items-center gap-3 text-steel-300"
          >
            {profile.role}
            <span className="h-px w-8 bg-accent/60" aria-hidden />
            {profile.location.split(',')[0]}
          </motion.p>

          <h1 className="display mt-6 text-4xl text-steel-100 sm:text-6xl lg:text-7xl">
            {HEADLINE.map((line, li) => (
              <span key={li} className="flex flex-wrap gap-x-[0.28em]">
                {line.map((word) => {
                  const delay = 0.12 + wordIndex++ * 0.05
                  return (
                    <motion.span
                      key={word.text}
                      initial={reduce ? false : { opacity: 0, y: '0.5em' }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay, ease: EASE }}
                      className={`inline-block ${word.accent ? 'text-accent' : ''}`}
                    >
                      {word.text}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>

          <motion.p
            {...rise(0.55)}
            className="mt-7 max-w-[46ch] text-lg leading-relaxed text-steel-300"
          >
            {profile.tagline}
          </motion.p>

          <motion.div {...rise(0.68)} className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticLink href="#work" variant="primary">
              View my work
              <ArrowDown size={16} />
            </MagneticLink>
            <MagneticLink href={`mailto:${profile.social.email}`} variant="ghost">
              Get in touch
              <ArrowUpRight size={16} />
            </MagneticLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
