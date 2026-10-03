import { useState } from 'react'
import { Check, Copy, Mail, Phone } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import SocialLinks from './SocialLinks'

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  const { profile } = usePortfolio()
  const { social } = profile
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    if (!social.email) return
    try {
      await navigator.clipboard.writeText(social.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard may be unavailable (insecure context) — fail silently.
    }
  }

  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="border-t border-white/10 bg-base">
      <div className="mx-auto grid max-w-content gap-12 px-6 py-16 md:grid-cols-3 md:py-20">
        {/* Brand */}
        <div>
          <a href="#home" className="text-2xl font-semibold tracking-tight text-white">
            {profile.shortName}
            <span className="text-accent-gradient">.</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#8b8f96]">
            {profile.specialization}
          </p>
          <p className="mt-2 text-sm text-[#6b6f76]">{profile.location}</p>
        </div>

        {/* Navigate */}
        <div>
          <p className="section-label mb-5">Navigate</p>
          <ul className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-[#b9bcc2] transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Reach out */}
        <div>
          <p className="section-label mb-5">Reach Out</p>

          {social.email && (
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${social.email}`}
                className="inline-flex items-center gap-2 text-sm text-[#b9bcc2] transition-colors hover:text-white"
              >
                <Mail size={16} className="text-[#a855f7]" />
                {social.email}
              </a>
              <button
                onClick={copyEmail}
                aria-label="Copy email address"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-[#8b8f96] transition-colors hover:border-white/25 hover:text-white"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {social.phone && (
            <a
              href={`tel:${social.phone}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-[#b9bcc2] transition-colors hover:text-white"
            >
              <Phone size={16} className="text-[#a855f7]" />
              {social.phone}
            </a>
          )}

          <SocialLinks variant="icon" className="mt-6" />
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-[#6b6f76] sm:flex-row">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <p>Designed &amp; built with React, TypeScript &amp; Tailwind.</p>
        </div>
      </div>
    </footer>
  )
}
