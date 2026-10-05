import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

interface Carousel3DProps<T> {
  items: T[]
  getId: (item: T) => string
  /** The compact card face shown on the ring. */
  renderFace: (item: T, index: number) => ReactNode
  /** The full details shown in the expanded panel on click. */
  renderDetail: (item: T, index: number) => ReactNode
  /** Per-item class for the card shell (e.g. the active role's neon frame). */
  cardClass?: (item: T) => string
  cardWidth?: number
  cardHeight?: number
  durationSec?: number
  ariaLabel?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A 3D revolving carousel. Each item sits once on a rotating cylinder (one card
 * per item, no duplicates); clicking a card opens an expanded panel with the
 * full details and pauses the rotation. Under reduced-motion it becomes a plain
 * grid of click-to-expand cards with no 3D or animation.
 */
export default function Carousel3D<T>({
  items,
  getId,
  renderFace,
  renderDetail,
  cardClass,
  cardWidth = 300,
  cardHeight = 300,
  durationSec = 30,
  ariaLabel,
}: Carousel3DProps<T>) {
  const reduce = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId != null ? items.find((it) => getId(it) === openId) ?? null : null

  // Escape closes the expanded panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const baseCard =
    'flex h-full w-full flex-col overflow-hidden rounded-2xl border p-6 text-left glass shadow-soft'

  const n = items.length
  const radius = Math.round(
    Math.max(cardWidth / 2 / Math.tan(Math.PI / Math.max(n, 2)), cardWidth * 0.9),
  )

  const faceCards = (asGrid: boolean) =>
    items.map((it, i) => {
      const id = getId(it)
      return asGrid ? (
        <div
          key={id}
          role="button"
          tabIndex={0}
          aria-expanded={openId === id}
          onClick={() => setOpenId(openId === id ? null : id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpenId(openId === id ? null : id)
            }
          }}
          className={cn(
            baseCard,
            'cursor-pointer select-none transition-colors hover:border-accent/40',
            cardClass?.(it),
          )}
        >
          {renderFace(it, i)}
          {openId === id && (
            <div className="mt-4 border-t border-hairline pt-4">{renderDetail(it, i)}</div>
          )}
        </div>
      ) : (
        <button
          key={id}
          type="button"
          onClick={() => setOpenId(id)}
          aria-label="Open details"
          style={{ transform: `rotateY(${(360 / items.length) * i}deg) translateZ(${radius}px)` }}
          className={cn('ring3d-item cursor-pointer', baseCard, cardClass?.(it))}
        >
          {renderFace(it, i)}
        </button>
      )
    })

  if (reduce) {
    return (
      <div aria-label={ariaLabel} className="grid gap-5 sm:grid-cols-2">
        {faceCards(true)}
      </div>
    )
  }

  return (
    <>
      <div
        aria-label={ariaLabel}
        className="ring3d-scene relative mx-auto"
        style={{ height: `${cardHeight + 48}px`, perspective: '1300px' }}
      >
        <div
          className={cn('ring3d', openId && 'is-paused')}
          style={
            {
              '--ring-dur': `${durationSec}s`,
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              left: '50%',
              top: '24px',
              marginLeft: `-${cardWidth / 2}px`,
            } as CSSProperties
          }
        >
          {faceCards(false)}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
              onClick={() => setOpenId(null)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.92, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className={cn(
                'relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-7 glass shadow-glow-blue md:p-8',
                cardClass?.(open),
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close details"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-hairline-strong text-steel-300 transition-colors hover:border-accent/60 hover:text-accent"
              >
                <X size={16} />
              </button>
              {renderDetail(open, items.indexOf(open))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
