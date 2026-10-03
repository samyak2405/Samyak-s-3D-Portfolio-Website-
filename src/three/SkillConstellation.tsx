import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { SkillCategory } from '../types/portfolio'
import { buildConstellation, type SkillNode } from './constellation'

const ACCENT = new THREE.Color('#e6a84b')
const STEEL = new THREE.Color('#aab2bd')

interface SkillConstellationProps {
  categories: SkillCategory[]
  reduced: boolean
}

/**
 * The skills constellation: category clusters of skill nodes tied to their
 * center by hairline spokes. Recent skills glow amber. Hovering a node lifts it
 * and shows a label. Rotation eases toward the pointer and freezes under
 * reduced-motion.
 */
export default function SkillConstellation({ categories, reduced }: SkillConstellationProps) {
  const { clusters, spokes } = useMemo(() => buildConstellation(categories), [categories])
  const nodes = useMemo(() => clusters.flatMap((c) => c.nodes), [clusters])
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<SkillNode | null>(null)

  const spokeGeometry = useMemo(() => {
    const positions = new Float32Array(spokes.length * 6)
    spokes.forEach(([a, b], i) => {
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [spokes])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return
    if (reduced) {
      group.rotation.set(0.12, 0.5, 0)
      return
    }
    group.rotation.y += delta * 0.07
    const targetX = state.pointer.y * -0.22
    const targetZ = state.pointer.x * 0.1
    group.rotation.x += (targetX + 0.08 - group.rotation.x) * 0.05
    group.rotation.z += (targetZ - group.rotation.z) * 0.05
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={spokeGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
      </lineSegments>

      {/* Category labels */}
      {clusters.map((cluster) => (
        <Html
          key={cluster.name}
          position={cluster.center}
          center
          pointerEvents="none"
          className="pointer-events-none select-none"
          distanceFactor={9}
        >
          <span className="whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel-400">
            {cluster.name}
          </span>
        </Html>
      ))}

      {/* Skill nodes */}
      {nodes.map((node, i) => {
        const isHovered = hovered === node
        const scale = isHovered ? 1.7 : 1
        return (
          <mesh
            key={`${node.category}-${node.name}-${i}`}
            position={node.position}
            scale={scale}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(node)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(null)
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[node.recent ? 0.085 : 0.065, 16, 16]} />
            <meshStandardMaterial
              color={node.recent ? ACCENT : STEEL}
              emissive={node.recent ? ACCENT : STEEL}
              emissiveIntensity={isHovered ? 1.1 : node.recent ? 0.55 : 0.15}
              metalness={0.5}
              roughness={0.4}
              toneMapped={!node.recent}
            />
          </mesh>
        )
      })}

      {/* Hover label */}
      {hovered && (
        <Html position={hovered.position} center distanceFactor={8} zIndexRange={[50, 0]}>
          <div className="pointer-events-none -translate-y-8 whitespace-nowrap rounded-full border border-hairline-strong bg-ink-2/95 px-3 py-1.5 text-center backdrop-blur-sm">
            <span className="text-xs text-steel-100">{hovered.name}</span>
            {hovered.recent && (
              <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-wider text-accent">
                new
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
