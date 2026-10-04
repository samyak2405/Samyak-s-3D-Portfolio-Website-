import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export const EASE = [0.16, 1, 0.3, 1] as const

interface NodeProps {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  accent?: boolean
  delay?: number
  reduced?: boolean
}

/** A schematic box node with a mono label (and optional sub-label). */
export function Node({ x, y, w, h, label, sub, accent, delay = 0, reduced }: NodeProps) {
  return (
    <motion.g
      initial={reduced ? false : { opacity: 0, y: 6 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        className={cn('fill-ink-3', accent ? 'stroke-accent/70' : 'stroke-hairline-strong')}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn('font-mono text-[11px]', accent ? 'fill-accent' : 'fill-steel-100')}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-steel-400 font-mono text-[8px]"
        >
          {sub}
        </text>
      )}
    </motion.g>
  )
}

interface PacketProps {
  path: string
  dur?: number
  begin?: number
  reduced?: boolean
  r?: number
}

/** A warm packet that travels a path (payments/events in flight). SMIL motion,
 * omitted entirely under reduced-motion. */
export function Packet({ path, dur = 3, begin = 0, reduced, r = 3.5 }: PacketProps) {
  if (reduced) return null
  return (
    <circle r={r} className="fill-accent" style={{ filter: 'drop-shadow(0 0 4px rgba(230,168,75,0.8))' }}>
      <animateMotion
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={path}
        calcMode="linear"
      />
    </circle>
  )
}

interface FlowLineProps {
  d: string
  delay?: number
  reduced?: boolean
  accent?: boolean
}

/** A connector that draws itself in on scroll. */
export function FlowLine({ d, delay = 0, reduced, accent }: FlowLineProps) {
  return (
    <motion.path
      d={d}
      fill="none"
      className={accent ? 'stroke-accent/40' : 'stroke-steel-500'}
      strokeWidth={1.25}
      initial={reduced ? false : { pathLength: 0, opacity: 0 }}
      whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    />
  )
}
