import type { PointerEvent } from 'react'

/**
 * Writes the pointer position as CSS custom properties (--mx / --my) on the
 * element under the cursor. Pair with the `.spotlight` class (see index.css) to
 * get a cursor-following glow. Updates the DOM directly, so it never triggers a
 * React re-render.
 */
export function onSpotlightMove(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  el.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
