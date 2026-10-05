import { usePortfolio } from '../../hooks/usePortfolio'
import Character from '../ui/Character'
import ProjectCard from '../ui/ProjectCard'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function Work() {
  const { projects } = usePortfolio()

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null
  const sorted = [...projects].sort((a, b) => Number(b.highlight) - Number(a.highlight))

  return (
    <section id="work" className="relative overflow-hidden border-t border-hairline py-24 md:py-32">
      <div aria-hidden className="grid-bg absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 42% at 25% 30%, rgba(77,139,255,0.10), transparent 70%), radial-gradient(38% 44% at 80% 80%, rgba(198,92,255,0.10), transparent 72%)',
        }}
      />
      <div className="container-edge relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <SectionHeading
            label="work"
            title="Things I've built on the side"
            lead="Projects where I get to own the whole stack. Correctness, concurrency, and scale, usually all at once."
          />
          <Reveal className="hidden justify-center lg:flex lg:justify-end">
            <Character
              pose="projects-thinking"
              alt="Samyak Moon, a 3D cartoon character in a navy suit, thinking with a hand on his chin"
              className="h-[42vh] w-auto lg:h-[54vh]"
            />
          </Reveal>
        </div>

        <div className="mx-auto mt-14 max-w-4xl space-y-5">
          {sorted.map((project, i) => (
            <ProjectCard key={project.id} project={project} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
