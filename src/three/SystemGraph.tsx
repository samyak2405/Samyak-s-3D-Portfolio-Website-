import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildSystemGraph } from './graph'

const ACCENT = new THREE.Color('#dd8420')
const STEEL = new THREE.Color('#7e93be')
const HUB = new THREE.Color('#2b4c8c')

interface SystemGraphProps {
  /** When true, the scene is frozen into a single composed frame. */
  reduced: boolean
}

/**
 * The hero's living diagram: steel service nodes, hairline connections, and warm
 * packets travelling the edges. All geometry is instanced, so node and packet
 * counts stay cheap. Rotation eases toward the pointer for a little parallax; the
 * whole thing collapses to a static frame under prefers-reduced-motion.
 */
export default function SystemGraph({ reduced }: SystemGraphProps) {
  const graph = useMemo(() => buildSystemGraph(), [])
  const groupRef = useRef<THREE.Group>(null)
  const packetsRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Edge line segments: two vertices per edge, built once.
  const edgeGeometry = useMemo(() => {
    const positions = new Float32Array(graph.edges.length * 6)
    graph.edges.forEach((edge, i) => {
      positions.set(
        [edge.start.x, edge.start.y, edge.start.z, edge.end.x, edge.end.y, edge.end.z],
        i * 6,
      )
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [graph])

  // Place node instances + tint hubs brighter. Runs once after mount.
  const applyNodes = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    graph.nodes.forEach((node, i) => {
      dummy.position.copy(node.position)
      dummy.scale.setScalar(node.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, node.hub ? HUB : STEEL)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  const clock = useRef(0)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (group) {
      if (reduced) {
        group.rotation.set(0.1, 0.5, 0)
      } else {
        group.rotation.y += delta * 0.08
        // Ease toward the pointer for a subtle parallax tilt.
        const targetX = state.pointer.y * -0.25
        const targetZ = state.pointer.x * 0.12
        group.rotation.x += (targetX + 0.08 - group.rotation.x) * 0.05
        group.rotation.z += (targetZ - group.rotation.z) * 0.05
      }
    }

    // Advance packets along their edges.
    if (!reduced) clock.current += delta
    const t = clock.current
    const packets = packetsRef.current
    if (packets) {
      graph.packets.forEach((packet, i) => {
        const edge = graph.edges[packet.edge]
        if (!edge) return
        const progress = (packet.offset + t * packet.speed) % 1
        dummy.position.copy(edge.start).lerp(edge.end, progress)
        dummy.scale.setScalar(0.04)
        dummy.updateMatrix()
        packets.setMatrixAt(i, dummy.matrix)
      })
      packets.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Connections */}
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          color="#2b4c8c"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </lineSegments>

      {/* Service nodes */}
      <instancedMesh ref={applyNodes} args={[undefined, undefined, graph.nodes.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          metalness={0.65}
          roughness={0.35}
          envMapIntensity={0.6}
        />
      </instancedMesh>

      {/* Packets — the one warm accent in the scene */}
      <instancedMesh
        ref={packetsRef}
        args={[undefined, undefined, graph.packets.length]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={ACCENT}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}
