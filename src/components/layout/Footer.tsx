import { ArrowUp } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'

export default function Footer() {
  const { profile } = usePortfolio()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline">
      <div className="container-edge flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-steel-200">{profile.name}</p>
          <p className="mt-1 font-mono text-xs text-steel-500">
            {profile.role} · {profile.location}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <p className="font-mono text-xs text-steel-500">© {year}</p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-2 text-sm text-steel-200 transition-colors duration-200 hover:border-steel-300 hover:text-steel-100"
          >
            Back to top
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
