import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import CanvasMount from '../../three/CanvasMount'
import Character from '../ui/Character'
import MagneticLink from '../ui/MagneticLink'

export default function Hero() {
  const { profile } = usePortfolio()

  const scope = useGsap<HTMLElement>(({ gsap, reduced }) => {
    if (reduced) return

    // Entrance
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-rise', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 })
      .from('.hero-character', { yPercent: 6, opacity: 0, duration: 1 }, '-=0.9')

    // Scroll parallax: character and backdrop drift at different rates.
    gsap.to('.hero-character', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.to('.hero-canvas', {
      yPercent: 16,
      ease: 'none',
      scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
    })
  })

  return (
    <section
      ref={scope}
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden"
    >
      {/* Soft daylight ambiance */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 18% 12%, rgba(43,76,140,0.08), transparent 70%), radial-gradient(55% 55% at 90% 80%, rgba(221,132,32,0.10), transparent 70%), linear-gradient(180deg, #FAF7F2 0%, #F3EDE3 100%)',
        }}
      />
      {/* Subtle 3D system, kept faint and masked to the right so it sits behind
          the character without crowding the text. */}
      <div
        className="hero-canvas absolute inset-0 opacity-30"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 58%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 58%)',
        }}
      >
        <CanvasMount />
      </div>

      <div className="container-edge relative grid min-h-[100dvh] items-center gap-8 pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-20">
        {/* Text */}
        <div className="order-2 max-w-xl lg:order-1">
          <p className="hero-rise mono-label flex items-center gap-3 text-accent">
            <span className="h-px w-8 bg-accent/50" aria-hidden />
            {profile.role}
          </p>
          <p className="hero-rise mt-6 text-lg text-steel-300">Hi, I'm Samyak Moon.</p>
          <h1 className="hero-rise display mt-2 text-[2.6rem] leading-[1.03] text-steel-100 sm:text-6xl lg:text-7xl">
            I build the systems behind the <span className="text-amber">systems</span>.
          </h1>
          <p className="hero-rise mt-6 max-w-md text-base leading-relaxed text-steel-300 md:text-lg">
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
            alt="Samyak Moon, a 3D cartoon character in a navy suit, waving hello"
            priority
            className="hero-character h-[44vh] w-auto max-w-full sm:h-[52vh] lg:h-[82vh]"
          />
        </div>
      </div>
    </section>
  )
}
