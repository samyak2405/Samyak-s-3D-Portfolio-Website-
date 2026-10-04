import { Cloud, Server, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'

/**
 * Maps the `icon` string in portfolio.json to a lucide icon component, so
 * content stays declarative. Unknown names fall back to `Server`.
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
