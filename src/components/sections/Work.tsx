import { usePortfolio } from '../../hooks/usePortfolio'
import ProjectCard from '../ui/ProjectCard'
import Statement from '../ui/Statement'

export default function Work() {
  const { projects } = usePortfolio()

  // Empty data hides its UI (project principle).
  if (projects.length === 0) return null

  // Highlighted projects first, order otherwise preserved.
  const sorted = [...projects].sort((a, b) => Number(b.highlight) - Number(a.highlight))

  return (
    <section id="work" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        <Statement
          eyebrow="Selected Work"
          align="center"
          className="mx-auto max-w-3xl text-3xl leading-[1.12] sm:text-4xl md:text-5xl"
          segments={[
            { text: 'Built to stay correct when' },
            { text: 'money and concurrency', className: 'text-dim display-italic' },
            { text: 'are both on the line.' },
          ]}
        />

        <div className="mx-auto mt-16 max-w-4xl space-y-5">
          {sorted.map((project, i) => (
            <ProjectCard key={project.id} project={project} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
