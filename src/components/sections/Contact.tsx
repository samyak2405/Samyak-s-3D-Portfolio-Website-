import { usePortfolio } from '../../hooks/usePortfolio'
import type { Social } from '../../types/portfolio'
import Reveal from '../ui/Reveal'

const PAGES = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'work', label: 'Work' },
]

const ELSEWHERE: Array<{ key: keyof Social; label: string }> = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'leetcode', label: 'LeetCode' },
]

export default function Contact() {
  const { profile } = usePortfolio()
  const { email, phone } = profile.social
  const elsewhere = ELSEWHERE.filter((e) => profile.social[e.key])

  return (
    <section id="contact" className="relative border-t border-hairline pb-24 pt-24 md:pt-36">
      <div className="container-edge">
        {/* The closing statement: a giant serif link. */}
        <Reveal>
          <a
            href={`mailto:${email}`}
            className="group block"
            aria-label={`Email ${profile.name}`}
          >
            <span className="display block text-[clamp(3.25rem,15vw,13rem)] leading-[0.95] text-steel-100">
              Get in{' '}
              <span className="display-italic text-dim transition-colors duration-300 group-hover:text-accent">
                touch.
              </span>
            </span>
          </a>
        </Reveal>

        {/* Email + link columns */}
        <div className="mt-20 grid gap-12 border-t border-hairline pt-12 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="display-italic display text-steel-400">Drop a line</p>
            <a
              href={`mailto:${email}`}
              className="mt-2 block font-mono text-lg text-steel-100 transition-colors duration-200 hover:text-accent sm:text-2xl"
            >
              {email}
            </a>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="mt-4 block font-mono text-sm text-steel-400 transition-colors hover:text-steel-200"
              >
                {phone}
              </a>
            )}
          </Reveal>

          <Reveal delay={0.08} className="flex gap-16 sm:gap-24">
            <nav>
              <p className="display-italic display mb-5 text-steel-400">Pages</p>
              <ul className="space-y-2.5">
                {PAGES.map((p) => (
                  <li key={p.id}>
                    <a
                      href={`#${p.id}`}
                      className="text-steel-200 transition-colors hover:text-steel-100"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {elsewhere.length > 0 && (
              <div>
                <p className="display-italic display mb-5 text-steel-400">Elsewhere</p>
                <ul className="space-y-2.5">
                  {elsewhere.map((e) => (
                    <li key={e.key}>
                      <a
                        href={profile.social[e.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-steel-200 transition-colors hover:text-steel-100"
                      >
                        {e.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
