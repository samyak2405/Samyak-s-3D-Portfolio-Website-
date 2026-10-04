import { usePortfolio } from '../../hooks/usePortfolio'
import { serviceIcon } from '../../lib/icons'
import Reveal from '../ui/Reveal'
import Statement from '../ui/Statement'

export default function Expertise() {
  const { services } = usePortfolio()

  return (
    <section id="expertise" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        {/* Headline (kept) + broadened subtext */}
        <div className="flex justify-end">
          <div className="max-w-2xl">
            <Statement
              align="right"
              eyebrow="// how I work"
              className="text-3xl leading-[1.12] sm:text-4xl md:text-5xl"
              segments={[
                { text: 'From first principles' },
                { text: 'to production,', className: 'text-dim' },
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
                <div className="group h-full rounded-2xl border border-hairline bg-ink-3 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow-blue">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-steel-100">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-300 [text-wrap:pretty]">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
