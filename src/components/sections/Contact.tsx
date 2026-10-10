import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import { RESUME_HREF } from '../../lib/links'
import { rng } from '../../lib/rng'
import Skyline from '../fx/Skyline'
import Reveal from '../ui/Reveal'

/**
 * Contact: "send a signal". A searchlight on a rooftop sweeps the night sky and
 * projects a web emblem onto the clouds. It follows the cursor (or sweeps on
 * its own), and hovering a way to reach me changes the emblem to that channel,
 * so the light in the sky calls out what you're about to use. Clouds drift in
 * layers that shift with the cursor for depth.
 *
 * The loop runs only while the section is on screen. Under reduced motion the
 * light holds still and the clouds stop drifting.
 */

interface Channel {
  id: string
  label: string
  value: string
  href: string
  glyph: string
}

/** "https://github.com/samyak2405" → "samyak2405"; "…/in/samyakmoon/" → "in/samyakmoon". */
function handle(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    if (parts[0] === 'u' && parts[1]) return parts[1]
    return parts.join('/')
  } catch {
    return url
  }
}

/** The emblem projected by the searchlight: an orb web, with the channel's
 *  letters stencilled over the hub when one is chosen. */
function Emblem({ glyph }: { glyph: string }) {
  const web = useMemo(() => {
    const spokes = 10
    const angles = Array.from({ length: spokes }, (_, k) => -Math.PI / 2 + (k * 2 * Math.PI) / spokes)
    const out = angles.map((a) => `M100 100L${(100 + Math.cos(a) * 92).toFixed(1)} ${(100 + Math.sin(a) * 92).toFixed(1)}`)
    for (const f of [0.28, 0.48, 0.68, 0.88]) {
      const pts = angles.map((a) => [100 + Math.cos(a) * 92 * f, 100 + Math.sin(a) * 92 * f])
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
      for (let i = 1; i <= spokes; i++) {
        const p0 = pts[i - 1]
        const p1 = pts[i % spokes]
        const mx = (p0[0] + p1[0]) / 2
        const my = (p0[1] + p1[1]) / 2
        d += `Q${(mx + (100 - mx) * 0.14).toFixed(1)} ${(my + (100 - my) * 0.14).toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
      }
      out.push(d)
    }
    return out
  }, [])
  return (
    <svg viewBox="0 0 200 200" className="signal-emblem" aria-hidden>
      <g className={cn('signal-web', glyph && 'has-glyph')}>
        {web.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {glyph ? (
        <text key={glyph} x="100" y="100" className="signal-glyph" textAnchor="middle" dominantBaseline="central">
          {glyph}
        </text>
      ) : (
        <circle cx="100" cy="100" r="7" className="signal-hub" />
      )}
    </svg>
  )
}

/** A field of stars for the upper sky, seeded so it's the same every visit. */
function Stars() {
  const stars = useMemo(() => {
    const r = rng(1024)
    return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 62, s: 0.6 + r() * 1.3, o: 0.25 + r() * 0.6 }))
  }, [])
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      {stars.map((st, i) => (
        <circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.s} fill="#dfe6ff" opacity={st.o} />
      ))}
    </svg>
  )
}

export default function Contact() {
  const { profile } = usePortfolio()
  const { email, github, linkedin, leetcode } = profile.social
  const year = new Date().getFullYear()

  const channels: Channel[] = [
    linkedin && { id: 'linkedin', label: 'LinkedIn', value: handle(linkedin), href: linkedin, glyph: 'in' },
    github && { id: 'github', label: 'GitHub', value: handle(github), href: github, glyph: 'GH' },
    leetcode && { id: 'leetcode', label: 'LeetCode', value: handle(leetcode), href: leetcode, glyph: 'LC' },
    { id: 'resume', label: 'Résumé', value: 'View or download', href: RESUME_HREF, glyph: 'CV' },
  ].filter(Boolean) as Channel[]

  const section = useRef<HTMLElement>(null)
  const sky = useRef<HTMLDivElement>(null)
  const lamp = useRef<HTMLDivElement>(null)
  const beam = useRef<HTMLDivElement>(null)
  const disc = useRef<HTMLDivElement>(null)
  const [glyph, setGlyph] = useState('')
  const [copied, setCopied] = useState(false)
  const emailText = useRef<HTMLSpanElement>(null)
  const hot = useRef(false)
  const engaged = useRef(false)

  const engage = () => {
    if (engaged.current) return
    engaged.current = true
    window.dispatchEvent(new CustomEvent('spidey:engaged', { detail: { id: 'contact' } }))
  }

  const call = (g: string) => {
    hot.current = !!g
    setGlyph(g)
    if (g && disc.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(disc.current, { '--pulse': 1.18 }, { '--pulse': 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
    }
  }

  const copy = async () => {
    engage()
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // No clipboard access: select the address so it can be copied by hand.
      const el = emailText.current
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }
  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(t)
  }, [copied])

  // The searchlight: aims where the cursor points (mapped into the open sky),
  // sweeps on its own when the cursor is elsewhere, and leans the cloud layers
  // for depth. Positions are written straight to the DOM each frame.
  useEffect(() => {
    const sec = section.current
    const skyEl = sky.current
    const lampEl = lamp.current
    const beamEl = beam.current
    const discEl = disc.current
    if (!sec || !skyEl || !lampEl || !beamEl || !discEl) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let lx = 0
    let ly = 0
    const measure = () => {
      const s = skyEl.getBoundingClientRect()
      const l = lampEl.getBoundingClientRect()
      w = s.width
      h = s.height
      lx = l.left - s.left + l.width / 2
      ly = l.top - s.top + l.height / 2
    }
    // The light plays over the open sky: the right side on wide screens, the
    // top band on narrow ones.
    const region = () =>
      w >= 1024
        ? { x0: w * 0.56, x1: w * 0.93, y0: h * 0.12, y1: h * 0.46 }
        : { x0: w * 0.15, x1: w * 0.88, y0: h * 0.04, y1: h * 0.2 }

    const aim = { x: 0, y: 0 }
    const at = { x: 0, y: 0 }
    const pointer = { x: 0.5, y: 0.4, inside: false }
    const par = { x: 0, y: 0 }

    const place = () => {
      const dx = at.x - lx
      const dy = at.y - ly
      const len = Math.hypot(dx, dy)
      const ang = Math.atan2(dy, dx)
      beamEl.style.width = `${len.toFixed(1)}px`
      beamEl.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) rotate(${ang.toFixed(4)}rad)`
      // The patch of light on the cloud deck reads as a level ellipse, with
      // the emblem upright in it.
      discEl.style.transform = `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px) translate(-50%, -50%) scale(calc(1.16 * var(--pulse, 1)), calc(0.84 * var(--pulse, 1)))`
      sec.style.setProperty('--cloud-x', par.x.toFixed(3))
      sec.style.setProperty('--cloud-y', par.y.toFixed(3))
    }

    measure()
    const r0 = region()
    at.x = aim.x = r0.x0 + (r0.x1 - r0.x0) * 0.55
    at.y = aim.y = r0.y0 + (r0.y1 - r0.y0) * 0.45
    place()

    const ro = new ResizeObserver(() => {
      measure()
      if (reduce) place()
    })
    ro.observe(skyEl)
    if (reduce) return () => ro.disconnect()

    const onMove = (e: PointerEvent) => {
      const s = sec.getBoundingClientRect()
      pointer.inside = e.clientY > s.top && e.clientY < s.bottom
      pointer.x = Math.max(0, Math.min(1, (e.clientX - s.left) / s.width))
      pointer.y = Math.max(0, Math.min(1, (e.clientY - s.top) / s.height))
    }

    let t = 0
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000
      t += dt
      const r = region()
      if (pointer.inside) {
        aim.x = r.x0 + (r.x1 - r.x0) * pointer.x
        aim.y = r.y0 + (r.y1 - r.y0) * pointer.y
      } else {
        // Idle: a slow figure-of-eight sweep across the sky.
        aim.x = r.x0 + (r.x1 - r.x0) * (0.5 + 0.45 * Math.sin(t * 0.32))
        aim.y = r.y0 + (r.y1 - r.y0) * (0.5 + 0.4 * Math.sin(t * 0.64 + 1))
      }
      const k = 1 - Math.exp(-dt / (hot.current ? 0.18 : 0.45))
      at.x += (aim.x - at.x) * k
      at.y += (aim.y - at.y) * k
      const pk = 1 - Math.exp(-dt / 0.6)
      par.x += ((pointer.inside ? pointer.x - 0.5 : 0) - par.x) * pk
      par.y += ((pointer.inside ? pointer.y - 0.5 : 0) - par.y) * pk
      place()
    }

    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        measure()
        gsap.ticker.add(tick)
        window.addEventListener('pointermove', onMove, { passive: true })
      }
      if (!entry.isIntersecting && running) {
        gsap.ticker.remove(tick)
        window.removeEventListener('pointermove', onMove)
      }
      running = entry.isIntersecting
    })
    io.observe(sec)
    return () => {
      ro.disconnect()
      io.disconnect()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section ref={section} id="contact" className="contact relative overflow-hidden text-white">
      {/* The night sky: stars, drifting clouds, the searchlight and its signal */}
      <div ref={sky} aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#07080f_0%,#0a0d1b_45%,#120c19_100%)]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 40% at 10% 6%, rgba(77,139,255,0.16), transparent 70%), radial-gradient(70% 40% at 72% 100%, rgba(255,59,74,0.26), transparent 72%)',
          }}
        />
        <Stars />
        <div className="cloud-layer is-far">
          <div />
        </div>
        <div ref={beam} className="signal-beam">
          <div />
        </div>
        <div className="cloud-layer is-mid">
          <div />
        </div>
        <div ref={disc} className="signal-disc">
          <Emblem glyph={glyph} />
        </div>
        <div className="cloud-layer is-near">
          <div />
        </div>
        <Skyline className="h-[24vh] min-h-[150px] max-h-[250px]" seed={29} />
        {/* The searchlight on its rooftop */}
        <div className="signal-roof">
          <div ref={lamp} className="signal-lamp" />
        </div>
      </div>

      <div className="container-edge relative pt-24 pb-52 md:pt-32 md:pb-64">
        <div className="max-w-[40rem]">
          <Reveal>
            <h2 className="display h-fluid-2">Let's build something that has to be correct.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70 [text-wrap:pretty]">
              I'm open to backend, full-stack, and fintech roles, and to payments work that has to hold up
              under load. The fastest way to reach me is email.
            </p>
          </Reveal>

          {/* Email: the main way in */}
          <Reveal delay={0.14}>
            <div
              className="contact-email mt-10"
              onPointerEnter={() => call('@')}
              onPointerLeave={() => call('')}
              onFocus={() => call('@')}
              onBlur={() => call('')}
            >
              <span
                ref={emailText}
                className="block font-display text-[clamp(1.6rem,8.4vw,3.4rem)] font-bold leading-none text-[color:var(--moonlight)]"
              >
                {/* If it ever has to wrap, it breaks before the @, never mid-domain. */}
                {email.split('@')[0]}
                <wbr />@{email.split('@')[1]}
              </span>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={`mailto:${email}`} onClick={engage} className="contact-btn is-primary">
                  Write to me
                </a>
                <button type="button" onClick={copy} className="contact-btn">
                  {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {copied ? 'Copied' : 'Copy email'}
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? 'Email address copied' : ''}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Other ways to reach me */}
          <Reveal delay={0.2}>
            <ul className="mt-12 grid gap-x-8 sm:grid-cols-2">
              {channels.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={() => call(c.glyph)}
                    onPointerLeave={() => call('')}
                    onFocus={() => call(c.glyph)}
                    onBlur={() => call('')}
                    onClick={engage}
                    className="contact-row group"
                  >
                    <span className="min-w-0">
                      <span className="block font-display text-[1.45rem] font-bold leading-none text-[color:var(--moonlight)]">
                        {c.label}
                      </span>
                      <span className="mt-1.5 block truncate text-sm text-white/50">{c.value}</span>
                    </span>
                    <ArrowUpRight size={18} aria-hidden className="contact-row-icon" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Footer line */}
        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-white/12 pt-8 text-sm text-white/55 sm:flex-row sm:items-center">
          <p className="flex flex-wrap gap-x-3">
            <span className="text-white/80">{profile.name}</span>
            <span>{profile.role}</span>
          </p>
          <div className="flex items-center gap-6 text-xs">
            <span>© {year}</span>
            <a href="#hero" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
