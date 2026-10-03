import * as THREE from 'three'

/**
 * Deterministic geometry for the hero's distributed-systems graph.
 *
 * The scene is a metaphor for Samyak's work: nodes are services spread across a
 * distributed system, hairline edges are the connections between them, and warm
 * packets travel the edges like payments and events moving through the platform.
 *
 * Everything here is pure and seeded, so the layout is stable across renders and
 * the component code stays free of magic numbers.
 */

export interface GraphNode {
  position: THREE.Vector3
  /** Hubs are the few larger "core service" nodes. */
  hub: boolean
  scale: number
}

export interface GraphEdge {
  a: number
  b: number
  start: THREE.Vector3
  end: THREE.Vector3
  length: number
}

export interface Packet {
  edge: number
  /** Travel speed in edge-lengths per second. */
  speed: number
  /** Phase offset so packets do not all depart together. */
  offset: number
}

export interface SystemGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  packets: Packet[]
  radius: number
}

/** Small deterministic PRNG (mulberry32) so the build is reproducible. */
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
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius),
    )
  }
  return points
}

export function buildSystemGraph(
  nodeCount = 22,
  radius = 2.65,
  seed = 20240417,
): SystemGraph {
  const rng = mulberry32(seed)
  const positions = fibonacciSphere(nodeCount, radius)

  // Hubs: a handful of nodes rendered slightly larger and brighter.
  const nodes: GraphNode[] = positions.map((position, i) => {
    const hub = i % 5 === 0
    return { position, hub, scale: hub ? 0.1 : 0.058 + rng() * 0.02 }
  })

  // Connect nodes that sit within a tuned angular distance. Cap each node's
  // degree so the mesh reads as a sparse network, not a solid ball of lines.
  const threshold = radius * 1.05
  const degree = new Array(nodeCount).fill(0)
  const maxDegree = 4
  const candidatePairs: Array<{ a: number; b: number; d: number }> = []

  for (let a = 0; a < nodeCount; a++) {
    for (let b = a + 1; b < nodeCount; b++) {
      const d = positions[a].distanceTo(positions[b])
      if (d < threshold) candidatePairs.push({ a, b, d })
    }
  }
  candidatePairs.sort((x, y) => x.d - y.d)

  const edges: GraphEdge[] = []
  for (const { a, b, d } of candidatePairs) {
    if (degree[a] >= maxDegree || degree[b] >= maxDegree) continue
    degree[a]++
    degree[b]++
    edges.push({ a, b, start: positions[a], end: positions[b], length: d })
  }

  // Seed packets onto roughly a third of the edges.
  const packets: Packet[] = []
  const packetCount = Math.max(6, Math.floor(edges.length / 3))
  for (let i = 0; i < packetCount; i++) {
    packets.push({
      edge: Math.floor(rng() * edges.length),
      speed: 0.35 + rng() * 0.4,
      offset: rng(),
    })
  }

  return { nodes, edges, packets, radius }
}
