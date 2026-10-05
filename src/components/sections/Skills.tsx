import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import Character from '../ui/Character'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

// Category -> accent hue. A periodic table reads as one thing only when each
// family has its own colour, so the "one accent" rule gives way to a small,
// harmonised set of tints (all similar lightness/saturation) decoded by a legend.
const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#4D8BFF',
  'Backend & Frameworks': '#38BDF8',
  'AI / ML': '#A78BFA',
  Databases: '#2DD4BF',
  'DevOps & Infra': '#F2B55C',
  'Distributed Systems & Domain': '#C65CFF',
  'Messaging & Observability': '#FB7185',
}
const FALLBACK_COLOR = '#4D8BFF'

// Two-letter "element symbol" per skill (a presentation detail, so it lives here
// rather than in the content JSON). Anything missing falls back to its initials.
const SYMBOLS: Record<string, string> = {
  Java: 'Jv',
  TypeScript: 'Ts',
  Python: 'Py',
  'Spring Boot': 'Sb',
  'REST APIs': 'Re',
  gRPC: 'gR',
  Microservices: 'Ms',
  'Multi-Tenancy': 'Mt',
  RAG: 'Rg',
  'LLM Integration': 'Ll',
  'AI Service Design': 'Ai',
  PostgreSQL: 'Pg',
  'Azure SQL': 'Az',
  MySQL: 'My',
  Redis: 'Rd',
  Elasticsearch: 'Es',
  Docker: 'Dk',
  Kubernetes: 'K8',
  'CI/CD': 'Ci',
  AWS: 'Aw',
  Jenkins: 'Je',
  Payments: 'Pm',
  'Card Systems': 'Cs',
  'HSM Integration': 'Hs',
  'Multi-Tenant Auth': 'Ta',
  'Distributed Systems Design': 'Ds',
  Kafka: 'Kf',
  RabbitMQ: 'Rb',
  'ELK Stack': 'Ek',
  Grafana: 'Gf',
}

function symbolFor(name: string) {
  if (SYMBOLS[name]) return SYMBOLS[name]
  const letters = name.replace(/[^a-zA-Z]/g, '')
  return (letters[0] ?? '?').toUpperCase() + (letters[1] ?? '').toLowerCase()
}

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.012 } } }
const tileIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function Skills() {
  const { skills } = usePortfolio()
  const reduce = useReducedMotion()

  // Flatten to a single ordered list so every element gets an atomic number,
  // while staying grouped by category so the colours cluster like a real table.
  const elements = skills.categories.flatMap((category) =>
    category.items.map((item) => ({
      item,
      category: category.name,
      color: CATEGORY_COLORS[category.name] ?? FALLBACK_COLOR,
    })),
  )

  return (
    <section id="skills" className="relative border-t border-hairline py-24 md:py-32">
      <div className="container-edge">
        <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          {/* The guide presents the stack to its right. */}
          <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <Character
              pose="skills-gesturing"
              alt="Samyak Moon, a 3D cartoon character in a hoodie, presenting his skills"
              className="w-full max-w-[13rem] lg:max-w-xs"
            />
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <SectionHeading
              label="skills"
              title="The periodic table of my stack"
              lead="Every tool I build with, as an element — grouped by where it lives in a system. The magenta-dotted elements are what I've picked up most recently."
            />
          </Reveal>
        </div>

        {/* Legend: colour key for the families */}
        <Reveal className="mt-14">
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
            {skills.categories.map((category) => {
              const color = CATEGORY_COLORS[category.name] ?? FALLBACK_COLOR
              return (
                <li
                  key={category.name}
                  className="flex items-center gap-2 font-mono text-xs text-steel-400"
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: color, boxShadow: `0 0 8px ${rgba(color, 0.55)}` }}
                  />
                  {category.name}
                </li>
              )
            })}
          </ul>
        </Reveal>

        {/* The table */}
        <motion.ul
          variants={reduce ? undefined : grid}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, margin: '-80px' }}
          className="mt-6 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(5rem,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(5.5rem,1fr))]"
        >
          {elements.map(({ item, category, color }, i) => (
            <motion.li
              key={`${category}-${item.name}`}
              variants={reduce ? undefined : tileIn}
              title={`${item.name} · ${category}`}
              aria-label={`${item.name}, ${category}${item.recent ? ', recently added' : ''}`}
              className="pt-tile group relative flex aspect-square flex-col justify-between rounded-xl border bg-ink-2 p-2.5"
              style={
                {
                  '--cat': color,
                  '--cat-glow': rgba(color, 0.4),
                  '--cat-soft': rgba(color, 0.08),
                  borderColor: rgba(color, 0.26),
                } as CSSProperties
              }
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[0.6rem] leading-none text-steel-500">
                  {i + 1}
                </span>
                {item.recent && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-amber shadow-glow-magenta"
                  />
                )}
              </div>
              <span
                aria-hidden
                className="self-start font-mono text-2xl font-semibold leading-none md:text-[1.7rem]"
                style={{ color }}
              >
                {symbolFor(item.name)}
              </span>
              <span className="font-mono text-[0.56rem] leading-tight text-steel-300 [overflow-wrap:anywhere]">
                {item.name}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
