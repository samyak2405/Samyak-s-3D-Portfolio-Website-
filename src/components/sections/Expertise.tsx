import { usePortfolio } from '../../hooks/usePortfolio'
import { cn } from '../../lib/cn'
import Reveal from '../ui/Reveal'
import Statement from '../ui/Statement'

export default function Expertise() {
  const { services } = usePortfolio()

  return (
    <section id="expertise" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        {/* Asymmetric serif statement, set to the right. */}
        <div className="flex justify-end">
          <div className="max-w-2xl">
            <Statement
              align="right"
              eyebrow="How I work"
              className="text-3xl leading-[1.12] sm:text-4xl md:text-5xl"
              segments={[
                { text: 'From first principles' },
                { text: 'to production,', className: 'text-dim display-italic' },
                { text: 'I own the whole system.' },
              ]}
            />
            <Reveal delay={0.1}>
              <p className="ml-auto mt-7 max-w-md text-right text-steel-300 [text-wrap:pretty]">
                Not a ticket inside someone else's design. I take problems where
                correctness, concurrency, and money all matter, and carry them end to end.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Capability columns, divided by hairlines. No cards, no icons. */}
        <div className="mt-24 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal
              key={service.title}
              delay={(i % 4) * 0.08}
              className={cn(
                'border-t border-hairline pt-7',
                i > 0 && 'lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0',
              )}
            >
              <h3 className="font-mono text-[0.7rem] uppercase tracking-label text-steel-200">
                {service.title}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-steel-300 [text-wrap:pretty]">
                {service.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
