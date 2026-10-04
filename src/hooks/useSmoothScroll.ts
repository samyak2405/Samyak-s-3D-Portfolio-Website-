import Lenis from 'lenis'
import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Inertial smooth scrolling (Lenis) driven by GSAP's ticker and wired into
 * ScrollTrigger so every scroll-driven animation stays in sync. Disabled under
 * reduced-motion, where native scrolling is used instead.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const onRaf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    // Anchor links should ease through Lenis rather than jump.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null
      const id = a?.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el as HTMLElement, { offset: -72 })
      }
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(onRaf)
      lenis.destroy()
    }
  }, [enabled])
}
