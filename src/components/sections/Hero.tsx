import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGsap } from '../../hooks/useGsap'
import { ScrollTrigger } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import Skyline from '../fx/Skyline'
import WebBackdrop from '../fx/WebBackdrop'
import type { CityScene } from '../fx/CityScene'
import MagneticLink from '../ui/MagneticLink'

const LINES = ['I build the systems', 'behind the systems.']

/** WebGL2 is what three.js needs; skip the 3D city entirely without it. */
function canRun3d() {
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    if (nav.connection?.saveData) return false
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * Mounts the lazy-loaded 3D night city into the hero. The SVG moon and skyline
 * underneath stay as the instant first paint and as the fallback (no WebGL,
 * Save-Data, or a load error); once the scene renders they fade out.
 */
function useCity(section: RefObject<HTMLElement>, canvas: RefObject<HTMLCanvasElement>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = section.current
    const cv = canvas.current
    if (!el || !cv || !canRun3d()) return

    let scene: CityScene | undefined
    let disposed = false
    let st: ScrollTrigger | undefined
    let io: IntersectionObserver | undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    const onVisibility = () => scene?.setActive(!document.hidden)

    import('../fx/CityScene')
      .then(({ createCityScene }) => {
        if (disposed) return
        scene = createCityScene(cv, { reducedMotion: reduce, lite: window.innerWidth < 768 })
        setReady(true)
        st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => scene?.setScroll(self.progress),
        })
        io = new IntersectionObserver(([entry]) => scene?.setActive(entry.isIntersecting && !document.hidden))
        io.observe(el)
        window.addEventListener('pointermove', onPointer, { passive: true })
        document.addEventListener('visibilitychange', onVisibility)
      })
      .catch(() => {
        // WebGL context or chunk failed: the SVG city stays.
      })

    return () => {
      disposed = true
      st?.kill()
      io?.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      scene?.dispose()
    }
  }, [section, canvas])

  return ready
}

export default function Hero() {
  const { profile } = usePortfolio()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const scope = useGsap<HTMLElement>(({ gsap, reduced }) => {
    if (reduced) return
    // The one orchestrated entrance: the headline lines tip up into place in
    // 3D while the camera glides into the city behind them.
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-line', {
        yPercent: 105,
        rotateX: -65,
        transformOrigin: '50% 100%',
        duration: 1.1,
        stagger: 0.12,
        delay: 0.15,
      })
      .from('.hero-rise', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.6')
      .from('.hero-moon', { yPercent: 14, opacity: 0, duration: 1.6 }, 0.2)
      .from('.hero-city', { yPercent: 18, opacity: 0, duration: 1.2 }, 0.4)

    const st = { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hero-moon', { yPercent: 35, ease: 'none', scrollTrigger: st })
    gsap.to('.hero-city', { yPercent: 12, ease: 'none', scrollTrigger: st })
    gsap.to('.hero-copy', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: st })
  })

  const city3d = useCity(scope, canvasRef)

  return (
    <section
      ref={scope}
      id="hero"
      data-city={city3d ? '3d' : 'svg'}
      className="group/hero relative min-h-[100dvh] overflow-hidden bg-ink"
    >
      {/* Night sky: suit-blue up top, a red city glow on the horizon */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 12% 0%, rgba(77,139,255,0.16), transparent 62%), radial-gradient(70% 38% at 55% 100%, rgba(255,59,74,0.22), transparent 70%), linear-gradient(to bottom, #07080f 0%, #0b0e1c 60%, #140b16 100%)',
        }}
      />

      {/* SVG city: instant first paint and the fallback when WebGL is off */}
      <div className={cn('absolute inset-0 transition-opacity duration-1000', city3d && 'opacity-0')}>
        <div aria-hidden className="halftone absolute inset-0 opacity-70 [--ht-at:0%_100%]" />
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
        <Skyline className="hero-city h-[22vh] min-h-[130px] max-h-[260px]" seed={11} />
      </div>

      {/* WebGL city (lazy chunk); fades in once it has drawn a frame */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          'absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000',
          city3d && 'opacity-100',
        )}
      />
      {/* Keep the headline side calm over the city */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,8,15,0.82) 0%, rgba(7,8,15,0.55) 34%, rgba(7,8,15,0) 62%), linear-gradient(to bottom, rgba(7,8,15,0.5) 0%, rgba(7,8,15,0) 22%)',
        }}
      />

      <WebBackdrop corner="tr" draw="load" delay={0.5} strength={0.2} seed={3} size="min(130vw, 980px)" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="container-edge relative flex min-h-[100dvh] items-center pt-24 pb-40 lg:pt-20 lg:pb-44">
        <div className="hero-copy max-w-4xl">
          <p className="hero-rise text-lg text-steel-300">
            Hi, I'm Samyak Moon, a backend and AI engineer.
          </p>
          <h1 className="headline h-fluid-1 mt-5 [perspective:900px] [text-shadow:0_2px_30px_rgba(7,8,15,0.85)]">
            {LINES.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span className="hero-line block will-change-transform">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero-rise mt-7 max-w-md text-base leading-relaxed text-steel-300 md:text-lg [text-wrap:pretty]">
            {profile.tagline}
          </p>
          <div className="hero-rise mt-10 flex flex-wrap items-center gap-3">
            <MagneticLink href="#work" variant="primary">
              See my work
            </MagneticLink>
            <MagneticLink href={`mailto:${profile.social.email}`} variant="ghost">
              Email me
            </MagneticLink>
          </div>
        </div>
      </div>
    </section>
  )
}
