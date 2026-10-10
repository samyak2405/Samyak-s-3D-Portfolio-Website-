import { usePortfolio } from '../../hooks/usePortfolio'
import type { Social } from '../../types/portfolio'
import Skyline from '../fx/Skyline'
import WebBackdrop from '../fx/WebBackdrop'
import Reveal from '../ui/Reveal'

const LINKS: Array<{ key: keyof Social; label: string }> = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'leetcode', label: 'LeetCode' },
]

export default function Contact() {
  const { profile } = usePortfolio()
  const { email, phone } = profile.social
  const links = LINKS.filter((l) => profile.social[l.key])
  const year = new Date().getFullYear()

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-focus text-white"
    >
      {/* Night city under a web: horizon glow, halftone, web, skyline */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 50% at 12% 8%, rgba(77,139,255,0.22), transparent 68%), radial-gradient(70% 45% at 70% 100%, rgba(255,59,74,0.30), transparent 70%)',
        }}
      />
      <div aria-hidden className="halftone absolute inset-0 opacity-70" />
      <WebBackdrop corner="tr" seed={5} strength={0.14} size="min(110vw, 900px)" />
      <Skyline className="h-[24vh] min-h-[140px] max-h-[240px]" seed={29} />
      <div className="container-edge relative pt-24 pb-44 md:pt-32 md:pb-56">
        {/* CTA */}
        <div className="max-w-4xl">
            <Reveal>
              <h2 className="display h-fluid-2">
                Let's build something
                <br className="hidden sm:block" /> that has to be correct.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md leading-relaxed text-white/65 [text-wrap:pretty]">
                I'm open to backend, full-stack, and fintech roles, and to payments work
                that has to hold up under load. The fastest way to reach me is email.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <a
                href={`mailto:${email}`}
                className="group mt-10 inline-flex items-center gap-3 font-display text-4xl font-bold tracking-[0.01em] text-white transition-colors hover:text-accent sm:text-6xl"
              >
                <span className="border-b-2 border-white/25 pb-1 transition-colors group-hover:border-accent">
                  {email}
                </span>
                              </a>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                {links.map((l) => (
                  <a
                    key={l.key}
                    href={profile.social[l.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex min-h-[44px] items-center text-sm tabular-nums text-white/50 transition-colors hover:text-white/80"
                  >
                    {phone}
                  </a>
                )}
              </div>
            </Reveal>
        </div>

        {/* Footer line */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/12 pt-8 text-sm text-white/55 sm:flex-row sm:items-center">
          <p className="flex flex-wrap gap-x-3">
            <span className="text-white/80">{profile.name}</span>
            <span>{profile.role}</span>
          </p>
          <div className="flex items-center gap-6 text-xs">
            <span>© {year}</span>
            <a
              href="#hero"
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-white"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
