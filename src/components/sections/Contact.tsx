import { ArrowUpRight } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import type { Social } from '../../types/portfolio'
import Character from '../ui/Character'
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
      {/* Warm ambiance on the dark focus section */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 50% at 12% 8%, rgba(77,139,255,0.28), transparent 68%), radial-gradient(48% 48% at 90% 88%, rgba(198,92,255,0.22), transparent 70%)',
        }}
      />
      <div className="container-edge relative py-24 md:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* CTA */}
          <div className="max-w-2xl">
            <Reveal>
              <p className="mono-label !text-amber">
                <span className="text-white/40">// </span>contact
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
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
                className="group mt-9 inline-flex items-center gap-3 font-mono text-lg text-white transition-colors hover:text-amber sm:text-2xl"
              >
                <span className="border-b border-white/30 pb-1 transition-colors group-hover:border-amber">
                  {email}
                </span>
                <ArrowUpRight size={22} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
                {phone && (
                  <a href={`tel:${phone}`} className="font-mono text-sm text-white/50 transition-colors hover:text-white/80">
                    {phone}
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {/* Character */}
          <div className="flex justify-center lg:justify-end">
            <Character
              pose="contact-thumbsup"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, giving a friendly thumbs up"
              shadow={false}
              className="h-[40vh] w-auto lg:h-[56vh]"
            />
          </div>
        </div>

        {/* Footer line */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/12 pt-8 text-sm text-white/55 sm:flex-row sm:items-center">
          <p>
            <span className="text-white/80">{profile.name}</span> · {profile.role}
          </p>
          <div className="flex items-center gap-6 font-mono text-xs">
            <span>© {year}</span>
            <a href="#hero" className="transition-colors hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
