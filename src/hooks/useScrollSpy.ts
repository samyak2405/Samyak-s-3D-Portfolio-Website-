import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently in view, for nav highlighting.
 * Uses a single IntersectionObserver (never a scroll listener) and picks the
 * entry closest to the top of the viewport among those intersecting.
 */
export function useScrollSpy(ids: string[], rootMargin = '-45% 0px -50% 0px'): string {
  const [active, setActive] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin, threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, rootMargin])

  return active
}
