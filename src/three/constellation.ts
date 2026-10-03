import * as THREE from 'three'
import type { SkillCategory } from '../types/portfolio'

/**
 * Deterministic geometry for the skills constellation: each category becomes a
 * cluster, each skill a node orbiting its category center, with hairline spokes
 * tying nodes to their cluster. Pure and seeded so the layout is stable.
 */

export interface SkillNode {
  category: string
  name: string
  recent: boolean
  position: THREE.Vector3
}

export interface SkillCluster {
  name: string
  center: THREE.Vector3
  nodes: SkillNode[]
}

export interface Constellation {
  clusters: SkillCluster[]
  /** Spoke endpoints (node -> its cluster center) for the connecting lines. */
  spokes: Array<[THREE.Vector3, THREE.Vector3]>
  radius: number
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Evenly distributed points on a sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    points.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius),
    )
  }
  return points
}

export function buildConstellation(
  categories: SkillCategory[],
  clusterRadius = 3.3,
  seed = 7310,
): Constellation {
  const rng = mulberry32(seed)
  const centers = fibonacciSphere(categories.length, clusterRadius)

  const clusters: SkillCluster[] = categories.map((category, ci) => {
    const center = centers[ci]
    // Spread this category's skills on a small sphere around its center.
    const local = fibonacciSphere(category.items.length, 0.55 + category.items.length * 0.05)
    const nodes: SkillNode[] = category.items.map((item, ni) => {
      // Jitter so clusters don't look mechanically identical.
      const jitter = new THREE.Vector3(
        (rng() - 0.5) * 0.25,
        (rng() - 0.5) * 0.25,
        (rng() - 0.5) * 0.25,
      )
      return {
        category: category.name,
        name: item.name,
        recent: !!item.recent,
        position: center.clone().add(local[ni]).add(jitter),
      }
    })
    return { name: category.name, center, nodes }
  })

  const spokes: Array<[THREE.Vector3, THREE.Vector3]> = []
  clusters.forEach((cluster) => {
    cluster.nodes.forEach((node) => spokes.push([node.position, cluster.center]))
  })

  return { clusters, spokes, radius: clusterRadius }
}
