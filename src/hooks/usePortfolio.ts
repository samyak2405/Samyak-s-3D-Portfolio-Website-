import data from '../data/portfolio.json'
import type { Portfolio } from '../types/portfolio'

/**
 * Single source of truth for all site content.
 * Components read from here — they never hardcode profile/experience/project copy.
 */
export function usePortfolio(): Portfolio {
  return data as Portfolio
}
