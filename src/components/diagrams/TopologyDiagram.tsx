import { useReducedMotion } from 'framer-motion'
import DiagramPanel from './DiagramPanel'
import { FlowLine, Node, Packet } from './primitives'

const LINKS = [
  'M410 70 L410 135', // gateway -> cards
  'M410 70 L160 135', // gateway -> auth
  'M410 70 L660 135', // gateway -> wallet
  'M160 185 L160 250', // auth -> redis
  'M410 185 L410 250', // cards -> postgres
  'M660 185 L660 250', // wallet -> kafka
  'M410 185 L660 250', // cards -> kafka (cross)
  'M660 185 L410 250', // wallet -> postgres (cross)
]

export default function TopologyDiagram() {
  const reduced = !!useReducedMotion()

  return (
    <DiagramPanel
      label="03 / Distributed systems"
      title="Services, messaging, and stores"
      description="A multi-tenant platform as a small topology: a gateway fans out to services that own their domains, talk over events, and keep state in the right store, so each piece scales and fails on its own."
      caption="A schematic, not the real service graph."
    >
      <svg
        viewBox="0 0 820 320"
        className="h-auto w-full"
        role="img"
        aria-labelledby="tp-title tp-desc"
      >
        <title id="tp-title">Distributed systems topology</title>
        <desc id="tp-desc">
          An API gateway routes to Auth, Cards, and Wallet services. The services
          communicate over Kafka events and persist state in Redis and PostgreSQL.
        </desc>

        {LINKS.map((d, i) => (
          <FlowLine key={d} d={d} delay={0.2 + i * 0.05} reduced={reduced} />
        ))}

        {/* Gateway */}
        <Node x={340} y={20} w={140} h={50} label="API Gateway" sub="REST / gRPC" accent delay={0} reduced={reduced} />

        {/* Services */}
        <Node x={90} y={135} w={140} h={50} label="Auth" sub="SecureAuthPro" delay={0.1} reduced={reduced} />
        <Node x={340} y={135} w={140} h={50} label="Cards" sub="lifecycle" delay={0.18} reduced={reduced} />
        <Node x={590} y={135} w={140} h={50} label="Wallet" sub="W2A transfers" delay={0.26} reduced={reduced} />

        {/* Stores / messaging */}
        <Node x={90} y={250} w={140} h={48} label="Redis" sub="OTP · cache" delay={0.34} reduced={reduced} />
        <Node x={340} y={250} w={140} h={48} label="PostgreSQL" sub="ledger" delay={0.42} reduced={reduced} />
        <Node x={590} y={250} w={140} h={48} label="Kafka" sub="events" delay={0.5} reduced={reduced} />

        <Packet path="M410 70 L410 135 L410 250" dur={3} begin={0} reduced={reduced} />
        <Packet path="M410 70 L160 135 L160 250" dur={3.4} begin={1} reduced={reduced} />
        <Packet path="M410 70 L660 135 L660 250" dur={3.2} begin={2} reduced={reduced} />
      </svg>
    </DiagramPanel>
  )
}
