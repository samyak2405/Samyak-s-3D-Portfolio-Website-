/**
 * Tiny seeded PRNG (mulberry32). The background art (webs, skyline) is
 * generated from a fixed seed so it looks hand-placed but renders identically
 * on every load and on the server/client alike.
 */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
