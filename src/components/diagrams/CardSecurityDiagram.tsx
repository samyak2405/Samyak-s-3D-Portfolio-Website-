import { useReducedMotion } from 'framer-motion'
import DiagramPanel from './DiagramPanel'
import { FlowLine, Node, Packet } from './primitives'

const STAGES = [
  { label: 'Card · PAN', sub: 'raw number' },
  { label: 'Tokenize', sub: 'surrogate value' },
  { label: 'HSM', sub: 'keys · PIN · PCI-DSS', accent: true },
  { label: 'Token', sub: 'safe to store' },
]

const W = 150
const H = 58
const LEFTS = [20, 230, 440, 650]
const CY = 95
const centerX = (i: number) => LEFTS[i] + W / 2

export default function CardSecurityDiagram() {
  const reduced = !!useReducedMotion()
  const baseline = `M${centerX(0)} ${CY} H${centerX(3)}`
  const hsmX = centerX(2)

  return (
    <DiagramPanel
      label="02 / Card security"
      title="Tokenization behind the HSM"
      description="Raw card data never sits in the clear. It is tokenized, with key and PIN operations isolated inside a PCI-DSS-compliant hardware security module; only the token is persisted."
      caption="The Atalla HSM integration cut transaction processing time by 60%."
    >
      <svg
        viewBox="0 0 820 170"
        className="h-auto w-full"
        role="img"
        aria-labelledby="cs-title cs-desc"
      >
        <title id="cs-title">Card tokenization and HSM security flow</title>
        <desc id="cs-desc">
          A raw card number is tokenized into a surrogate value. Key and PIN
          operations run inside a PCI-DSS-compliant hardware security module, and
          only the resulting token is stored.
        </desc>

        <FlowLine d={baseline} reduced={reduced} />

        {[0, 1, 2].map((i) => {
          const x = (centerX(i) + centerX(i + 1)) / 2
          return (
            <path
              key={i}
              d={`M${x - 4} ${CY - 4} L${x + 3} ${CY} L${x - 4} ${CY + 4}`}
              fill="none"
              className="stroke-steel-400"
              strokeWidth={1.25}
            />
          )
        })}

        {/* Lock glyph over the HSM node */}
        <g className="stroke-accent fill-accent" strokeWidth={1.25}>
          <path d={`M${hsmX - 5} ${CY - H / 2 - 12} v-3 a5 5 0 0 1 10 0 v3`} fill="none" />
          <rect x={hsmX - 7} y={CY - H / 2 - 12} width={14} height={10} rx={2} className="fill-accent/80 stroke-none" />
        </g>

        {STAGES.map((s, i) => (
          <Node
            key={s.label}
            x={LEFTS[i]}
            y={CY - H / 2}
            w={W}
            h={H}
            label={s.label}
            sub={s.sub}
            accent={s.accent}
            delay={i * 0.1}
            reduced={reduced}
          />
        ))}

        <Packet path={baseline} dur={3.6} begin={0} reduced={reduced} />
      </svg>
    </DiagramPanel>
  )
}
