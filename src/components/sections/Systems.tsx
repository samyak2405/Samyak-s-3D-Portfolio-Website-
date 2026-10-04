import CardSecurityDiagram from '../diagrams/CardSecurityDiagram'
import PaymentFlowDiagram from '../diagrams/PaymentFlowDiagram'
import TopologyDiagram from '../diagrams/TopologyDiagram'
import SectionHeading from '../ui/SectionHeading'

export default function Systems() {
  return (
    <section id="systems" className="relative border-t border-hairline py-24 md:py-36">
      <div className="container-edge">
        <SectionHeading
          label="systems"
          title="Systems, drawn simply"
          lead="The shape of a few things I've built. Schematic on purpose: the point is the thinking, not the wiring."
        />

        <div className="mt-14 space-y-6 md:space-y-8">
          <PaymentFlowDiagram />
          <CardSecurityDiagram />
          <TopologyDiagram />
        </div>
      </div>
    </section>
  )
}
