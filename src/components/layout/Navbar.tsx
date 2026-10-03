import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { cn } from '../../lib/cn'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const { profile } = usePortfolio()
  const active = useScrollSpy(['hero', ...LINKS.map((l) => l.id)])
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-hairline bg-ink/70 backdrop-blur-md">
        <nav className="container-edge flex h-16 items-center justify-between">
          <a
            href="#hero"
            className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-steel-100"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-hairline-strong font-mono text-[0.7rem] text-accent">
              SM
            </span>
            {profile.name}
          </a>

          {/* Desktop nav — single line */}
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm transition-colors duration-200',
                    active === link.id
                      ? 'text-steel-100'
                      : 'text-steel-400 hover:text-steel-200',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${profile.social.email}`}
            className="hidden rounded-full border border-hairline-strong px-4 py-2 text-sm text-steel-100 transition-colors duration-200 hover:border-steel-300 hover:bg-white/[0.03] md:inline-flex"
          >
            Get in touch
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-hairline-strong text-steel-100 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-hairline bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="container-edge flex flex-col py-3">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block py-3 text-base',
                      active === link.id ? 'text-accent' : 'text-steel-200',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${profile.social.email}`}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-ink"
                >
                  Get in touch
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
