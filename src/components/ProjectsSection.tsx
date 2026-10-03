import { usePortfolio } from '../hooks/usePortfolio'
import ProjectCard from './ProjectCard'

export default function ProjectsSection() {
  const { projects } = usePortfolio()
  if (projects.length === 0) return null

  // Featured projects first, original order otherwise.
  const ordered = [...projects].sort(
    (a, b) => Number(b.highlight) - Number(a.highlight),
  )

  return (
    <section id="projects" className="mx-auto max-w-content px-6 py-24 md:py-32">
      <p className="section-label mb-4">04 — Projects</p>
      <h2 className="mb-12 text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
        Things I&apos;ve <span className="text-chrome">built.</span>
      </h2>

      <div className="flex flex-col gap-8">
        {ordered.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
