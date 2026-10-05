import { useReducedMotion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface MarqueeProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  /** Pause the motion (e.g. while a card is open). Hover/focus also pause via CSS. */
  paused?: boolean
  /** One full loop duration, seconds. */
  durationSec?: number
  ariaLabel?: string
}

/**
 * A continuously-scrolling row of cards. The items are rendered twice so the
 * track can loop seamlessly; motion pauses on hover, on keyboard focus, and when
 * `paused` is set. Under reduced-motion it falls back to a manually scrollable,
 * snap-aligned row with no animation.
 */
export default function Marquee<T>({
  items,
  renderItem,
  paused,
  durationSec = 44,
  ariaLabel,
}: MarqueeProps<T>) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div
        aria-label={ariaLabel}
        data-lenis-prevent
        className="flex gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className="shrink-0 snap-center">
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      aria-label={ariaLabel}
      data-lenis-prevent
      className={cn('marquee group relative overflow-hidden', paused && 'is-paused')}
    >
      <div
        className="marquee-track flex w-max py-1"
        style={{ '--marquee-dur': `${durationSec}s` } as CSSProperties}
      >
        {[0, 1].map((set) => (
          <div key={set} aria-hidden={set === 1} className="flex w-max shrink-0">
            {items.map((item, i) => (
              <div key={i} className="mr-5">
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
