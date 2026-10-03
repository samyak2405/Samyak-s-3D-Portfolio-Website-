import { usePortfolio } from '../../hooks/usePortfolio'
import { serviceIcon } from '../../lib/icons'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function Expertise() {
  const { services } = usePortfolio()

  return (
    <section id="expertise" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        <SectionHeading
          title="What I work on"
          lead="The problems I reach for are the ones where correctness, concurrency, and money all have to line up at scale."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
          {services.map((service, i) => {
            const Icon = serviceIcon(service.icon)
            return (
              <Reveal
                key={service.title}
                delay={(i % 2) * 0.08}
                className="group relative bg-ink-2 p-8 transition-colors duration-300 hover:bg-ink-3 md:p-10"
              >
                {/* Machined top edge that lights up on hover (feedback) */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent/60 transition-transform duration-500 group-hover:scale-x-100"
                />
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-hairline-strong bg-accent-dim text-accent">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-lg font-medium text-steel-100">{service.title}</h3>
                <p className="mt-3 max-w-[48ch] leading-relaxed text-steel-300">
                  {service.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
