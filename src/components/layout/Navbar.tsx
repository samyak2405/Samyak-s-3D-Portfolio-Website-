import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { cn } from '../../lib/cn'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
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

  const [first, ...rest] = profile.name.split(' ')

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="container-edge flex h-20 items-center justify-between">
        <a href="#hero" className="text-base tracking-tight text-steel-100">
          <span className="font-semibold">{first}</span>{' '}
          <span className="text-steel-300">{rest.join(' ')}</span>
        </a>

        {/* Desktop nav — single line */}
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={cn(
                  'text-sm transition-colors duration-200',
                  active === link.id ? 'text-steel-100' : 'text-steel-400 hover:text-steel-200',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center text-steel-100 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-y border-hairline bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="container-edge flex flex-col py-4">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block py-3 text-lg',
                      active === link.id ? 'text-accent' : 'text-steel-200',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
