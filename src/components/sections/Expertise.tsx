import { usePortfolio } from '../../hooks/usePortfolio'
import { serviceIcon } from '../../lib/icons'
import Reveal from '../ui/Reveal'
import Statement from '../ui/Statement'
import Tilt from '../ui/Tilt'
import WebBackdrop from '../fx/WebBackdrop'

export default function Expertise() {
  const { services } = usePortfolio()

  return (
    <section id="expertise" className="relative border-t border-hairline py-24 md:py-32">
      <div aria-hidden className="halftone halftone-blue absolute inset-0 opacity-60 [--ht-at:0%_100%]" />
      <WebBackdrop corner="br" seed={41} size="min(85vw, 680px)" />
      <div className="container-edge relative">
        {/* Headline (kept) + broadened subtext */}
        <div className="flex justify-end">
          <div className="max-w-3xl">
            <Statement
              align="right"
              className="h-fluid-2"
              segments={[
                { text: 'From first principles' },
                { text: 'to production,' },
                { text: 'I own the whole system.' },
              ]}
            />
            <Reveal delay={0.1}>
              <p className="ml-auto mt-7 max-w-md text-right text-steel-300 [text-wrap:pretty]">
                Not a ticket inside someone else's design. I take problems where
                correctness, concurrency, and scale all matter, and carry them end to end.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Pillars: icon cards with scroll-reveal + hover micro-interactions */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = serviceIcon(service.icon)
            return (
              <Reveal key={service.title} delay={(i % 4) * 0.08} className="h-full">
                <Tilt className="h-full">
                  <div className="panel h-full rounded-2xl p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent [transform:translateZ(36px)]">
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-6 font-display text-[1.7rem] font-bold leading-none text-[color:var(--moonlight)] [transform:translateZ(24px)]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-steel-300 [text-wrap:pretty] [transform:translateZ(12px)]">
                      {service.description}
                    </p>
                  </div>
                </Tilt>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
