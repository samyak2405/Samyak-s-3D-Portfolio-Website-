import { usePortfolio } from '../../hooks/usePortfolio'
import Reveal from '../ui/Reveal'
import SocialLinks from '../ui/SocialLinks'

export default function Contact() {
  const { profile } = usePortfolio()
  const { email, phone } = profile.social

  return (
    <section id="contact" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="display text-3xl text-steel-100 sm:text-4xl md:text-5xl">
              Building something where correctness,
              <br className="hidden sm:block" /> concurrency, and money all matter?
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-steel-300">
              I am open to backend and fintech roles, and to payments work that
              needs to hold up under load. The fastest way to reach me is email.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <a
              href={`mailto:${email}`}
              className="mt-10 inline-block font-mono text-xl text-steel-100 underline decoration-accent decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-accent sm:text-2xl md:text-3xl"
            >
              {email}
            </a>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col items-center gap-5">
              <SocialLinks social={profile.social} className="justify-center" />
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="font-mono text-sm text-steel-400 transition-colors hover:text-steel-200"
                >
                  {phone}
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
