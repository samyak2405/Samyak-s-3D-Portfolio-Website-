import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

// Résumé (hosted on Google Drive so it can be updated without a redeploy).
const RESUME_HREF = 'https://drive.google.com/file/d/1cSZYen95FkxBLyH9gXPjErrijZ74luh7/view'

export default function Navbar() {
  const { profile } = usePortfolio()
  // #systems has no nav item of its own — treat it as part of Experience so the
  // scroll-spy keeps "Experience" lit while the reader is in that section.
  const spy = useScrollSpy(['hero', 'about', 'skills', 'experience', 'systems', 'expertise', 'work', 'contact'])
  const active = spy === 'systems' ? 'experience' : spy
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduce = useReducedMotion()

  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [first, ...rest] = profile.name.split(' ')

  // Switch the header background on after a little scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile menu: lock scroll, trap focus, Escape to close (focus back to toggle).
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      )
    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open
          ? 'border-b border-white/[0.06] bg-[rgba(10,11,13,0.72)] [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]'
          : 'border-b border-transparent',
      )}
    >
      <nav className="container-edge flex h-16 items-center justify-between md:h-20">
        <a href="#hero" className="-m-2 p-2 text-base tracking-tight text-steel-100">
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
          <li>
            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-hairline-strong px-3 py-1.5 text-sm text-steel-200 transition-colors hover:border-accent/60 hover:text-accent"
            >
              Résumé
              <ArrowUpRight size={14} />
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-m-2 grid h-11 w-11 place-items-center text-steel-100 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu — full-height opaque panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] overflow-y-auto bg-ink md:hidden"
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
              <li>
                <a
                  href={RESUME_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 py-3 text-lg text-steel-200"
                >
                  Résumé
                  <ArrowUpRight size={18} />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
