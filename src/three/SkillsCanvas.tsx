import { Canvas } from '@react-three/fiber'
import type { SkillCategory } from '../types/portfolio'
import SkillConstellation from './SkillConstellation'

interface SkillsCanvasProps {
  categories: SkillCategory[]
  reduced: boolean
  active: boolean
}

/**
 * Canvas host for the skills constellation: capped DPR, depth fog, lighting, and
 * a render loop that idles when the section is off screen or motion is reduced.
 */
export default function SkillsCanvas({ categories, reduced, active }: SkillsCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 42 }}
      frameloop={reduced || !active ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <fog attach="fog" args={['#faf7f2', 8, 20]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 0, 3]} intensity={4} distance={12} color="#dd8420" />
      <SkillConstellation categories={categories} reduced={reduced} />
    </Canvas>
  )
}
