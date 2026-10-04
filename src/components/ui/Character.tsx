import { asset } from '../../lib/asset'
import { cn } from '../../lib/cn'

interface CharacterProps {
  /** Basename in public/characters, e.g. "hero-wave". */
  pose: string
  alt: string
  className?: string
  /** Load eagerly (above the fold) instead of lazily. */
  priority?: boolean
  /** Draw a soft contact shadow beneath the cutout. */
  shadow?: boolean
}

/**
 * The recurring 3D-cartoon guide, rendered as an optimized transparent WebP
 * cutout. Meaningful alt text keeps each pose accessible; off-screen poses load
 * lazily. Parallax/entrance motion is applied by the parent section via GSAP.
 */
export default function Character({ pose, alt, className, priority, shadow = true }: CharacterProps) {
  return (
    <div className={cn('relative inline-flex', shadow && 'character-shadow', className)}>
      <img
        src={asset(`/characters/${pose}.webp`)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="relative h-full w-auto max-w-full select-none object-contain"
      />
    </div>
  )
}
