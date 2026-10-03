import { motion } from 'framer-motion'
import { Server, ShieldCheck, Cloud, Sparkles, Boxes } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'

const ICONS: Record<string, LucideIcon> = {
  Server,
  ShieldCheck,
  Cloud,
  Sparkles,
}

export default function ServicesSection() {
  const { services } = usePortfolio()
  if (services.length === 0) return null

  return (
    <section id="services" className="mx-auto max-w-content px-6 py-24 md:py-32">
      <p className="section-label mb-4">03 — What I Do</p>
      <h2 className="mb-12 text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
        How I can <span className="text-chrome">help.</span>
      </h2>

      <div className="border-b border-white/10">
        {services.map((service, i) => {
          const Icon = ICONS[service.icon] ?? Boxes
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="group grid grid-cols-1 gap-6 border-t border-white/10 py-10 md:grid-cols-[auto_auto_1fr] md:items-start"
            >
              <div className="font-mono text-4xl font-bold text-white/15 md:text-5xl">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#a855f7] transition-colors group-hover:border-white/25">
                <Icon size={22} />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white sm:text-2xl">{service.title}</h3>
                <p className="mt-3 max-w-3xl leading-relaxed text-[#b9bcc2]">
                  {service.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
