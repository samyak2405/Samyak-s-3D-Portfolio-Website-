import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register once, app-wide. All scroll-driven animation goes through ScrollTrigger.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  // Web fonts swap in after first layout and change section heights, which
  // leaves every trigger's start/end measured against the fallback font.
  // Re-measure once the real fonts are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

export { gsap, ScrollTrigger }
