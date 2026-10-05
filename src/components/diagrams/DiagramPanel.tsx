import type { ReactNode } from 'react'
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
      <figure className="relative overflow-hidden rounded-2xl border border-hairline bg-ink-3 p-6 shadow-soft md:p-10">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <div className="max-w-xl">
            <span className="mono-label">{label}</span>
            <h3 className="mt-3 text-xl font-medium text-steel-100">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-300 [text-wrap:pretty]">
              {description}
            </p>
          </div>
          {/* Scales to fit the panel (viewBox + width:100%) so it never needs a
              sideways scroll and nothing runs off-canvas. */}
          <div className="mt-8">{children}</div>
          <figcaption className="mt-5 font-mono text-xs text-steel-400">{caption}</figcaption>
        </div>
      </figure>
    </Reveal>
  )
}
