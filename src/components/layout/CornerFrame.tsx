/**
 * A thin, fixed frame around the viewport with brighter L-shaped brackets at the
 * four corners. Purely decorative scaffolding that gives the page its "framed,
 * instrument" character. Sits above content but never intercepts pointer events.
 */
const CORNERS = [
  'top-0 left-0 border-t border-l',
  'top-0 right-0 border-t border-r',
  'bottom-0 left-0 border-b border-l',
  'bottom-0 right-0 border-b border-r',
] as const

export default function CornerFrame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-40"
      style={{ inset: 'var(--frame-inset)' }}
    >
      {/* Faint full outline */}
      <div className="absolute inset-0 border border-white/[0.06]" />
      {/* Brighter corner brackets */}
      {CORNERS.map((pos) => (
        <span
          key={pos}
          className={`absolute h-5 w-5 border-white/25 md:h-7 md:w-7 ${pos}`}
        />
      ))}
    </div>
  )
}
