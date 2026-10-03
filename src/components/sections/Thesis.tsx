import Statement from '../ui/Statement'

/**
 * A large editorial serif statement between the hero and the record. Brightness
 * contrast carries the emphasis; the one warm word keeps Samyak's signature.
 */
export default function Thesis() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="container-edge">
        <Statement
          align="center"
          className="mx-auto max-w-4xl text-4xl leading-[1.1] sm:text-5xl md:text-6xl"
          segments={[
            { text: 'Designing systems where correctness,' },
            { text: 'concurrency, and', className: 'text-dim display-italic' },
            { text: 'money', className: 'text-accent display-italic' },
            { text: 'all have to', className: 'text-dim display-italic' },
            { text: 'line up at scale.' },
          ]}
        />
      </div>
    </section>
  )
}
