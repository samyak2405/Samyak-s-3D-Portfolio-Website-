import { Code2, Github, Linkedin, type LucideIcon } from 'lucide-react'
import type { Social } from '../../types/portfolio'
import { cn } from '../../lib/cn'

interface SocialLinksProps {
  social: Social
  className?: string
}

const PROFILES: Array<{ key: keyof Social; label: string; icon: LucideIcon }> = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'leetcode', label: 'LeetCode', icon: Code2 },
]

/** Renders profile links, skipping any that are empty (empty data hides its UI). */
export default function SocialLinks({ social, className }: SocialLinksProps) {
  const available = PROFILES.filter((p) => social[p.key])
  if (available.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap items-center gap-3', className)}>
      {available.map(({ key, label, icon: Icon }) => (
        <li key={key}>
          <a
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-2 text-sm text-steel-200 transition-colors duration-200 hover:border-steel-300 hover:text-steel-100"
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}
