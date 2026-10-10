import { useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import Skyline from '../fx/Skyline'
import WebBackdrop from '../fx/WebBackdrop'
import MagneticLink from '../ui/MagneticLink'

// The headline, split so the second "systems" keeps its suit-red glow.
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
        {part(HEAD_B, HEAD_A.length, 'text-accent glow-primary')}
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
      .from('.hero-moon', { yPercent: 14, opacity: 0, duration: 1.6 }, '-=0.9')
      .from('.hero-city', { yPercent: 18, opacity: 0, duration: 1.2 }, '<0.2')

    // Night-sky parallax: the moon drifts slower than the page, the city a
    // little slower still, so the hero has depth as you leave it.
    const st = { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hero-moon', { yPercent: 35, ease: 'none', scrollTrigger: st })
    gsap.to('.hero-city', { yPercent: 12, ease: 'none', scrollTrigger: st })
  })

  return (
    <section ref={scope} id="hero" className="relative min-h-[100dvh] overflow-hidden bg-ink">
      {/* Night sky: suit-blue up top, a red city glow on the horizon */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 12% 0%, rgba(77,139,255,0.16), transparent 62%), radial-gradient(70% 38% at 55% 100%, rgba(255,59,74,0.22), transparent 70%), linear-gradient(to bottom, #07080f 0%, #0b0e1c 60%, #140b16 100%)',
        }}
      />
      <div aria-hidden className="halftone absolute inset-0 opacity-70 [--ht-at:0%_100%]" />

      {/* The moon (a nod to the surname), framed by the web */}
      <div
        aria-hidden
        className="hero-moon absolute right-[-36px] top-16 aspect-square w-[150px] rounded-full opacity-80 sm:right-[4%] sm:top-[9%] sm:w-[260px] lg:right-[10%] lg:top-[16%] lg:w-[min(26vw,380px)]"
        style={{
          background:
            'radial-gradient(circle at 30% 64%, rgba(70,68,98,0.30), transparent 10%), radial-gradient(circle at 63% 31%, rgba(70,68,98,0.24), transparent 13%), radial-gradient(circle at 71% 69%, rgba(70,68,98,0.2), transparent 7%), radial-gradient(circle at 45% 47%, rgba(70,68,98,0.12), transparent 22%), radial-gradient(circle at 34% 30%, #e6e4ee 0%, #c4c1d4 38%, #8b88a2 76%, #5a5772 100%)',
          boxShadow:
            'inset -26px -20px 60px rgba(7,8,15,0.5), 0 0 60px 4px rgba(225,225,255,0.10), 0 0 200px 40px rgba(77,139,255,0.10)',
        }}
      />

      <WebBackdrop corner="tr" draw="load" delay={0.5} strength={0.2} seed={3} size="min(130vw, 980px)" />

      <Skyline className="hero-city h-[22vh] min-h-[130px] max-h-[260px]" seed={11} />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="container-edge relative flex min-h-[100dvh] items-center pt-24 pb-40 lg:pt-20 lg:pb-44">
        <div className="max-w-xl">
          <p className="hero-rise mono-label text-accent">// {profile.role}</p>
          <p className="hero-rise mt-6 text-lg text-steel-300">Hi, I'm Samyak Moon.</p>
          <h1
            aria-label={HEAD_FULL}
            className="hero-rise headline h-fluid-1 mt-3 text-steel-100 [text-shadow:0_2px_24px_rgba(7,8,15,0.9)]"
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
      </div>
    </section>
  )
}
