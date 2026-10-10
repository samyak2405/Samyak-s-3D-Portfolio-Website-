import { useEffect, useRef } from 'react'
import { asset } from '../../lib/asset'
import { gsap, ScrollTrigger } from '../../lib/gsap'

// Intrinsic size of public/spidey.webp. The web thread enters the image at the
// exact horizontal centre, so the CSS thread and the rotation pivot share x=50%.
const SRC_W = 221
const SRC_H = 465

// Where the figure parks at the top of the page (just under the h-20 header)
// and how far above the viewport bottom it stops at the end of the page.
const TOP_GAP = 92
const BOTTOM_GAP = 28
// The CSS thread runs a few px into the image so it meets the painted thread.
const THREAD_OVERLAP = 4
// Where the speech bubble's tail sits, as a fraction of his height (his head
// is at the bottom: he hangs upside down).
const SAY_AT = 0.84

/** What he says beside each section, keyed by section id. */
const LINES: Record<string, string> = {
  skills: 'Hover a group to spin its web!',
}

/**
 * Spider-Man hanging on a web thread in the right-hand gutter. He drops down as
 * the page scrolls (top of page = just under the header, bottom of page = near
 * the bottom of the viewport), swings like a pendulum when the scroll speed
 * changes, and clicking him zips back to the top through the same Lenis anchor
 * handling every other link uses.
 *
 * Desktop only (lg+), where there is a gutter to hang in. Under reduced motion
 * he stays parked at the top: no descent, no swing, no drop-in.
 */
export default function SpiderDrop() {
  const layerRef = useRef<HTMLDivElement>(null)
  const rigRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLSpanElement>(null)
  const spideyRef = useRef<HTMLAnchorElement>(null)
  const sayRef = useRef<HTMLSpanElement>(null)
  const sayTextRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const rig = rigRef.current
    const thread = threadRef.current
    const spidey = spideyRef.current
    const say = sayRef.current
    const sayText = sayTextRef.current
    if (!layer || !rig || !thread || !spidey || !say || !sayText) return

    const mm = gsap.matchMedia()

    mm.add(
      { desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
        if (!desktop) return

        // Layout is read on resize only, never per frame.
        let viewH = layer.clientHeight
        let figH = spidey.offsetHeight
        const measure = () => {
          viewH = layer.clientHeight
          figH = spidey.offsetHeight
        }

        const setY = gsap.quickSetter(spidey, 'y', 'px')
        const setSayY = gsap.quickSetter(say, 'y', 'px')
        const setThread = gsap.quickSetter(thread, 'scaleY')
        const setAngle = gsap.quickSetter(rig, 'rotation', 'deg')

        // Speech bubble: shown while a section with a line is in view. The
        // skills line retires once the visitor has picked a group.
        const done = new Set<string>()
        const showing = new Set<string>()
        const refreshSay = () => {
          const id = [...showing].find((s) => !done.has(s))
          if (id) sayText.textContent = LINES[id]
          say.toggleAttribute('data-show', !!id)
        }
        const sayTriggers = Object.keys(LINES).flatMap((id) => {
          const el = document.getElementById(id)
          if (!el) return []
          return [
            ScrollTrigger.create({
              trigger: el,
              start: 'top 55%',
              end: 'bottom 45%',
              onToggle: (self) => {
                if (self.isActive) showing.add(id)
                else showing.delete(id)
                refreshSay()
              },
            }),
          ]
        })
        let retire: number | undefined
        const onEngaged = () => {
          window.clearTimeout(retire)
          retire = window.setTimeout(() => {
            done.add('skills')
            refreshSay()
          }, 1200)
        }
        window.addEventListener('skills:engaged', onEngaged)
        const sayCleanup = () => {
          sayTriggers.forEach((t) => t.kill())
          window.removeEventListener('skills:engaged', onEngaged)
          window.clearTimeout(retire)
          say.removeAttribute('data-show')
        }

        const dropFor = (p: number) => {
          const top = TOP_GAP
          const bottom = Math.max(top, viewH - figH - BOTTOM_GAP)
          return top + (bottom - top) * p
        }
        const render = (y: number, angle: number) => {
          setY(y)
          setSayY(y + figH * SAY_AT)
          setThread(Math.max(0, y + THREAD_OVERLAP) / viewH)
          setAngle(angle)
        }

        if (reduce) {
          const park = () => {
            measure()
            render(dropFor(0), 0)
          }
          park()
          window.addEventListener('resize', park)
          return () => {
            window.removeEventListener('resize', park)
            sayCleanup()
          }
        }

        // `intro` drops him in from above the viewport on load (elastic, like
        // landing on the end of the web); `p` is the smoothed scroll progress.
        const state = { intro: 0, p: 0, target: 0, angle: 0, vel: 0, aim: 0 }

        const st = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            state.target = self.progress
          },
          onRefresh: (self) => {
            measure()
            state.target = self.progress
          },
        })
        state.p = state.target = st.progress

        const intro = gsap.to(state, {
          intro: 1,
          duration: 1.5,
          delay: 1.1, // after the hero headline has risen in
          ease: 'elastic.out(1, 0.55)',
        })

        const tick = (time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs, 50) / 1000

          // A little lag on top of Lenis gives him some weight on the rope.
          state.p += (state.target - state.p) * (1 - Math.exp(-dt / 0.14))

          const rest = dropFor(state.p)
          const y = -figH - 24 + (rest + figH + 24) * state.intro

          // Pendulum on a rope of length L: a longer rope swings slower and
          // through a smaller angle, so the sideways travel stays ~40px.
          const L = Math.max(80, y + figH * 0.6)
          const maxDeg = gsap.utils.clamp(2, 10, (Math.atan(40 / L) * 180) / Math.PI)
          const speed = st.getVelocity() // px/s, positive when scrolling down
          const push = gsap.utils.clamp(-maxDeg, maxDeg, speed / 220)
          // Smooth the push so a flick of the wheel doesn't snap the angle.
          state.aim += (push - state.aim) * (1 - Math.exp(-dt / 0.08))
          const idle = Math.sin(time * 1.1) * 0.7 // barely-there sway when still

          const w2 = 6000 / L // ω² = g / L, tuned so a 300px rope swings in ~1.4s
          const zeta = 0.16
          const acc = -w2 * (state.angle - state.aim - idle) - 2 * zeta * Math.sqrt(w2) * state.vel
          state.vel += acc * dt
          state.angle += state.vel * dt

          render(y, state.angle)
        }

        render(-figH - 24, 0)
        gsap.ticker.add(tick)
        window.addEventListener('resize', measure)

        return () => {
          gsap.ticker.remove(tick)
          window.removeEventListener('resize', measure)
          intro.kill()
          st.kill()
          sayCleanup()
        }
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-40 hidden overflow-hidden lg:block"
    >
      <div
        ref={rigRef}
        className="spidey-rig absolute top-0 h-full origin-top will-change-transform"
      >
        <span ref={threadRef} aria-hidden className="spidey-thread" />
        <span ref={sayRef} aria-hidden className="spidey-say">
          <span ref={sayTextRef} />
        </span>
        <a
          ref={spideyRef}
          href="#hero"
          aria-label="Back to top"
          className="spidey group pointer-events-auto absolute left-0 top-0 block w-full will-change-transform"
        >
          <img
            src={asset('/spidey.webp')}
            width={SRC_W}
            height={SRC_H}
            alt=""
            draggable={false}
            decoding="async"
            className="block h-auto w-full select-none"
          />
          <span className="spidey-tip meta-label" aria-hidden>
            Back to top
          </span>
        </a>
      </div>
    </div>
  )
}
