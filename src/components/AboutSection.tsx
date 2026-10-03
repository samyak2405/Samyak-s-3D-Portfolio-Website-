import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'

export default function AboutSection() {
  const { profile, skills, education } = usePortfolio()

  return (
    <section id="about" className="mx-auto max-w-content px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <p className="section-label mb-4">01 — About</p>
        <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          I build the backend systems that move money{' '}
          <span className="text-chrome">safely and at scale.</span>
        </h2>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#b9bcc2]">{profile.bio}</p>
      </motion.div>

      {/* Skills */}
      <div id="skills" className="mt-20 scroll-mt-24">
        <p className="section-label mb-8">Skills & Tooling</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="card-dark p-6"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                {cat.name}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-[#b9bcc2]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mt-20">
        <p className="section-label mb-8">Education</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {education.map((ed) => (
            <div key={ed.degree} className="card-dark flex items-start gap-4 p-6">
              <GraduationCap className="mt-1 shrink-0 text-[#a855f7]" size={22} />
              <div>
                <h3 className="font-semibold text-white">{ed.degree}</h3>
                <p className="mt-1 text-sm text-[#b9bcc2]">{ed.institution}</p>
                <p className="mono-pill mt-3 inline-block">{ed.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
