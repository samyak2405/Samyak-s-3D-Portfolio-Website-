/**
 * Resolve a public-asset path (e.g. "/avatar.png" from portfolio.json) against
 * Vite's configured base URL. On GitHub Pages the site is served from a project
 * subpath, so a bare "/avatar.png" would otherwise point at the domain root.
 * External URLs (http/https) and empty strings are returned unchanged.
 */
export function asset(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}
