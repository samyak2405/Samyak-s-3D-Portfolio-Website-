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

// Intrinsic sizes of the shipped WebPs, so width/height reserve space (no CLS).
const DIMS: Record<string, [number, number]> = {
  'hero-wave': [921, 1280],
  'hero-style': [921, 1280],
  'about-arms-crossed': [709, 1280],
  'work-laptop': [921, 1280],
  'projects-thinking': [751, 1280],
  'skills-gesturing': [921, 1280],
  'contact-thumbsup': [921, 1280],
}

/**
 * The recurring 3D-cartoon guide, rendered as an optimized transparent WebP.
 * A 480px variant is served to small screens via srcset. Intrinsic width/height
 * prevent layout shift; the hero loads eagerly with high fetch priority, every
 * other pose loads lazily.
 */
export default function Character({ pose, alt, className, priority, shadow = true }: CharacterProps) {
  const [w, h] = DIMS[pose] ?? [921, 1280]
  return (
    <div className={cn('relative inline-flex', shadow && 'character-glow', className)}>
      <img
        src={asset(`/characters/${pose}.webp`)}
        srcSet={`${asset(`/characters/${pose}-480.webp`)} 480w, ${asset(`/characters/${pose}.webp`)} ${w}w`}
        sizes="(max-width: 767px) 240px, 40vw"
        width={w}
        height={h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        draggable={false}
        className="relative h-full w-auto max-w-full select-none object-contain"
      />
    </div>
  )
}
