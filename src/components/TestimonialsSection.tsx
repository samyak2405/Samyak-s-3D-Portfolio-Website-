import { usePortfolio } from '../hooks/usePortfolio'
import type { Testimonial } from '../types/portfolio'

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="card-dark mx-4 flex w-[340px] shrink-0 flex-col justify-between p-7 sm:w-[420px]">
      <blockquote className="text-lg italic leading-relaxed text-[#d4d6da]">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-black"
          style={{ backgroundColor: t.avatarColor }}
        >
          {t.name.charAt(0)}
        </span>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-white">{t.name}</div>
          <div className="text-xs text-[#8b8f96]">{t.role}</div>
        </div>
      </figcaption>
    </figure>
  )
}

export default function TestimonialsSection() {
  const { testimonials } = usePortfolio()

  // Never render an empty (or faked) testimonials section — guide's rule.
  if (testimonials.length === 0) return null

  // Duplicate the list so the marquee loops seamlessly at -50%.
  const loop = [...testimonials, ...testimonials]

  return (
    <section id="testimonials" className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto mb-12 max-w-content px-6">
        <p className="section-label mb-4">05 — Testimonials</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
          Kind <span className="text-chrome">words.</span>
        </h2>
      </div>

      <div className="relative">
        <div className="marquee-track">
          {loop.map((t, i) => (
            <Card key={`${t.id}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
