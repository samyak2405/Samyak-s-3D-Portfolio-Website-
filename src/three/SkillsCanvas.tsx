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
      <fog attach="fog" args={['#09090f', 7, 18]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#cdd6e2" />
      <pointLight position={[0, 0, 3]} intensity={5} distance={12} color="#e6a84b" />
      <SkillConstellation categories={categories} reduced={reduced} />
    </Canvas>
  )
}
