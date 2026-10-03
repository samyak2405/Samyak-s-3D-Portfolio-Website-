import { Cloud, Server, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'

/**
 * Maps the `icon` string in portfolio.json to a concrete lucide icon component.
 * Content stays declarative (a name in JSON); components never hardcode which
 * icon belongs to which service. Unknown names fall back to `Server`.
 */
const ICONS: Record<string, LucideIcon> = {
  Server,
  ShieldCheck,
  Cloud,
  Sparkles,
}

export function serviceIcon(name: string): LucideIcon {
  return ICONS[name] ?? Server
}
