import { useReducedMotion } from 'framer-motion'
import DiagramPanel from './DiagramPanel'
import { FlowLine, Node, Packet } from './primitives'

const STAGES = [
  { label: 'Auth request', sub: 'card / UPI' },
  { label: 'Risk & 2FA', sub: 'OTP / MPIN' },
  { label: 'Authorize', sub: 'Visa / RuPay' },
  { label: 'Capture', sub: 'idempotent' },
  { label: 'Settle', sub: '+ reconcile', accent: true },
]

const W = 136
const H = 56
const LEFTS = [10, 176, 342, 508, 674]
const CY = 78
const centerX = (i: number) => LEFTS[i] + W / 2

export default function PaymentFlowDiagram() {
  const reduced = !!useReducedMotion()
  const baseline = `M${centerX(0)} ${CY} H${centerX(4)}`

  return (
    <DiagramPanel
      label="01 / Payments"
      title="Authorization to settlement"
      description="How a transaction moves: an auth request clears risk and two-factor checks, authorizes on the card network, is captured idempotently, then settles and reconciles."
      caption="Simplified. Real flows add captures, partial reversals, and refunds."
    >
      <svg
        viewBox="0 0 820 160"
        className="h-auto w-full"
        role="img"
        aria-labelledby="pf-title pf-desc"
      >
        <title id="pf-title">Payment authorization and settlement flow</title>
        <desc id="pf-desc">
          A card or UPI auth request passes through risk and two-factor checks,
          authorization on Visa or RuPay, idempotent capture, then settlement and
          reconciliation.
        </desc>

        <FlowLine d={baseline} reduced={reduced} />

        {/* Direction chevrons in the gaps */}
        {[0, 1, 2, 3].map((i) => {
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

        <Packet path={baseline} dur={3.4} begin={0} reduced={reduced} />
        <Packet path={baseline} dur={3.4} begin={1.7} reduced={reduced} />
      </svg>
    </DiagramPanel>
  )
}
