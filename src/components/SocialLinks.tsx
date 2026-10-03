import { Github, Linkedin, Mail, Instagram, Globe, Code2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'

interface Props {
  /** Visual variant: "pill" for the hero row, "icon" for compact icon buttons. */
  variant?: 'pill' | 'icon'
  className?: string
}

interface LinkDef {
  key: string
  label: string
  href: string
  Icon: LucideIcon
}

export default function SocialLinks({ variant = 'icon', className = '' }: Props) {
  const { social } = usePortfolio().profile

  const links: LinkDef[] = [
    { key: 'github', label: 'GitHub', href: social.github, Icon: Github },
    { key: 'linkedin', label: 'LinkedIn', href: social.linkedin, Icon: Linkedin },
    { key: 'leetcode', label: 'LeetCode', href: social.leetcode, Icon: Code2 },
    { key: 'instagram', label: 'Instagram', href: social.instagram, Icon: Instagram },
    { key: 'website', label: 'Website', href: social.website, Icon: Globe },
    {
      key: 'email',
      label: 'Email',
      href: social.email ? `mailto:${social.email}` : '',
      Icon: Mail,
    },
  ].filter((l) => l.href.trim() !== '') // hide empty social links

  if (links.length === 0) return null

  if (variant === 'pill') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {links.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            target={key === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#b9bcc2] transition-colors hover:border-white/25 hover:text-white"
          >
            <Icon size={16} className="transition-transform group-hover:scale-110" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target={key === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#b9bcc2] transition-colors hover:border-white/25 hover:text-white"
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  )
}
