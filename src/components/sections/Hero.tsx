import { useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import Character from '../ui/Character'
import MagneticLink from '../ui/MagneticLink'

// The headline, split so the second "systems" keeps its magenta glow.
const HEAD_A = 'I build the systems behind the '
const HEAD_B = 'systems'
const HEAD_C = '.'
const HEAD_FULL = HEAD_A + HEAD_B + HEAD_C

/**
 * Types the headline out character by character. The full text is always in the
 * DOM (untyped chars are transparent) so layout never shifts and the heading
 * stays readable to search engines and screen readers. A caret blinks at the
 * typing position and is removed once typing finishes. Under reduced-motion the
 * whole headline shows instantly with no caret.
 */
function TypedHeadline() {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(reduce ? HEAD_FULL.length : 0)

  useEffect(() => {
    if (reduce) {
      setCount(HEAD_FULL.length)
      return
    }
    let i = 0
    let interval: ReturnType<typeof setInterval>
    // Start just after the heading has risen in.
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setCount(i)
        if (i >= HEAD_FULL.length) clearInterval(interval)
      }, 48)
    }, 450)
    return () => {
      clearTimeout(delay)
      clearInterval(interval)
    }
  }, [reduce])

  const done = count >= HEAD_FULL.length

  const part = (text: string, start: number, className = '') => {
    const n = Math.max(0, Math.min(text.length, count - start))
    const caretHere = !reduce && !done && count >= start && count < start + text.length
    return (
      <>
        <span className={className}>{text.slice(0, n)}</span>
        {caretHere && <span className="cursor" aria-hidden />}
        <span className="text-transparent">{text.slice(n)}</span>
      </>
    )
  }

  return (
    <span aria-hidden>
      {part(HEAD_A, 0)}
      <span className="whitespace-nowrap">
        {part(HEAD_B, HEAD_A.length, 'text-magenta glow-magenta')}
        {part(HEAD_C, HEAD_A.length + HEAD_B.length)}
      </span>
    </span>
  )
}

export default function Hero() {
  const { profile } = usePortfolio()

  const scope = useGsap<HTMLElement>(({ gsap, reduced }) => {
    if (reduced) return
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-rise', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 })
      .from('.hero-character', { yPercent: 6, opacity: 0, duration: 1 }, '-=0.9')

    gsap.to('.hero-character', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
    })
  })

  return (
    <section ref={scope} id="hero" className="relative min-h-[100dvh] overflow-hidden bg-ink">
      {/* IDE-dark ambiance: faint grid + neon radial glows */}
      <div aria-hidden className="grid-bg absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(52% 50% at 16% 8%, rgba(77,139,255,0.16), transparent 60%), radial-gradient(48% 52% at 88% 88%, rgba(198,92,255,0.14), transparent 62%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="container-edge relative grid min-h-[100dvh] items-center gap-8 pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-20">
        {/* Text */}
        <div className="order-2 max-w-xl lg:order-1">
          <p className="hero-rise mono-label text-accent">// {profile.role}</p>
          <p className="hero-rise mt-6 text-lg text-steel-300">Hi, I'm Samyak Moon.</p>
          <h1
            aria-label={HEAD_FULL}
            className="hero-rise display mt-3 text-[1.9rem] leading-[1.1] text-steel-100 sm:text-4xl lg:text-[2.9rem]"
          >
            <TypedHeadline />
          </h1>
          <p className="hero-rise mt-6 max-w-md leading-relaxed text-steel-300 md:text-lg">
            {profile.tagline}
          </p>
          <div className="hero-rise mt-9 flex flex-wrap items-center gap-3">
            <MagneticLink href="#work" variant="primary">
              View my work
              <ArrowDown size={16} />
            </MagneticLink>
            <MagneticLink href={`mailto:${profile.social.email}`} variant="ghost">
              Get in touch
              <ArrowUpRight size={16} />
            </MagneticLink>
          </div>
        </div>

        {/* Character */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <Character
            pose="hero-wave"
            alt="Samyak Moon, a 3D cartoon gamer-coder character in a hoodie with headphones, waving hello"
            priority
            className="hero-character h-[44vh] w-auto sm:h-[52vh] lg:h-[82vh]"
          />
        </div>
      </div>
    </section>
  )
}
