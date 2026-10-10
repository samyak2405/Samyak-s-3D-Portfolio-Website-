import type { ReactNode } from 'react'
import Tilt from '../ui/Tilt'
import Reveal from '../ui/Reveal'

interface DiagramPanelProps {
  label: string
  title: string
  description: string
  caption: string
  children: ReactNode
}

/**
 * Consistent frame for a schematic diagram: a labelled header, the SVG, and a
 * one-line caption. The SVG itself carries <title>/<desc> for screen readers.
 */
export default function DiagramPanel({
  label,
  title,
  description,
  caption,
  children,
}: DiagramPanelProps) {
  return (
    <Reveal>
      <Tilt max={2.5} lift={8}>
      <figure className="panel relative overflow-hidden rounded-2xl p-6 md:p-10">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <div className="max-w-xl">
            <span className="meta-label">{label}</span>
            <h3 className="mt-2 font-display text-3xl font-bold leading-none text-[color:var(--moonlight)]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-300 [text-wrap:pretty]">
              {description}
            </p>
          </div>
          {/* Scales to fit the panel (viewBox + width:100%) so it never needs a
              sideways scroll and nothing runs off-canvas. */}
          <div className="mt-8">{children}</div>
          <figcaption className="mt-5 text-xs text-steel-400">{caption}</figcaption>
        </div>
      </figure>
      </Tilt>
    </Reveal>
  )
}
