import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { asset } from '../../lib/asset'
import { cn } from '../../lib/cn'
import { ANIMATED_POSES } from '../../lib/animatedPoses'

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
 * The recurring 3D-cartoon guide. By default it renders as an optimized
 * transparent WebP (a 480px variant is served to small screens via srcset).
 *
 * When the pose is listed in ANIMATED_POSES and the viewer allows motion, it
 * instead plays a looping, muted idle video (rendered on the same dark
 * background, so it blends seamlessly), with the WebP as the poster and as the
 * fallback for reduced-motion, unsupported browsers, or a load error.
 *
 * Intrinsic width/height prevent layout shift; the hero loads eagerly with high
 * fetch priority, every other pose loads lazily.
 */
export default function Character({ pose, alt, className, priority, shadow = true }: CharacterProps) {
  const [w, h] = DIMS[pose] ?? [921, 1280]
  const reduceMotion = useReducedMotion()
  const [videoFailed, setVideoFailed] = useState(false)
  const animate = ANIMATED_POSES.has(pose) && !reduceMotion && !videoFailed

  // Shared visual treatment so the video and the img are interchangeable.
  const mediaClass = 'relative h-full w-auto max-w-full select-none object-contain'

  return (
    <div className={cn('relative inline-flex', shadow && 'character-glow', className)}>
      {animate ? (
        <video
          key={pose}
          width={w}
          height={h}
          poster={asset(`/characters/${pose}.webp`)}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          preload={priority ? 'auto' : 'metadata'}
          aria-label={alt}
          onError={() => setVideoFailed(true)}
          className={mediaClass}
        >
          <source src={asset(`/characters/${pose}.webm`)} type="video/webm" />
          <source src={asset(`/characters/${pose}.mp4`)} type="video/mp4" />
        </video>
      ) : (
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
          className={mediaClass}
        />
      )}
    </div>
  )
}
