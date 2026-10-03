import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  /** e.g. "85%", "60%", "10+". The leading number is counted up; the rest is kept. */
  value: string
  className?: string
  duration?: number
}

/**
 * Counts the leading number up from zero when it scrolls into view, preserving
 * any suffix (%, +, ...). Draws the eye to the resume-backed outcomes. Under
 * prefers-reduced-motion it renders the final value immediately.
 */
export default function Counter({ value, className, duration = 1.4 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
  const hasNumber = match !== null
  const target = match ? parseFloat(match[1]) : 0
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0
  const suffix = match ? match[2] : ''

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!hasNumber) return
    if (reduce) {
      setCurrent(target)
      return
    }
    if (!inView) return
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCurrent(v),
    })
    return () => controls.stop()
    // Deps are all primitives so the animation isn't restarted on every frame
    // by setCurrent re-renders.
  }, [inView, reduce, target, duration, hasNumber])

  if (!hasNumber) return <span className={className}>{value}</span>

  return (
    <span ref={ref} className={className}>
      {current.toFixed(decimals)}
      {suffix}
    </span>
  )
}
