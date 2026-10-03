import { useEffect, useState, type RefObject } from 'react'

/**
 * True while the referenced element intersects the viewport. Used to pause the
 * WebGL render loop when the hero scrolls off screen (battery + CPU), rather
 * than rendering frames nobody can see.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
