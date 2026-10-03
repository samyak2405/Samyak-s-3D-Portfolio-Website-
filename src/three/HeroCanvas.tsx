import { Canvas } from '@react-three/fiber'
import SystemGraph from './SystemGraph'

interface HeroCanvasProps {
  reduced: boolean
  /** Hero is on screen — render continuously; otherwise idle the loop. */
  active: boolean
}

/**
 * Canvas host for the hero scene. Keeps WebGL concerns in one place: capped DPR,
 * depth fog, lighting, and a render loop that idles when the hero is off screen
 * or the visitor prefers reduced motion.
 */
export default function HeroCanvas({ reduced, active }: HeroCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      frameloop={reduced || !active ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <fog attach="fog" args={['#09090f', 5, 13]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#cdd6e2" />
      <directionalLight position={[-5, -3, -4]} intensity={0.5} color="#5b6472" />
      {/* Faint warm fill so the steel picks up a hint of the accent. */}
      <pointLight position={[0, 0, 2]} intensity={6} distance={9} color="#e6a84b" />
      <SystemGraph reduced={reduced} />
    </Canvas>
  )
}
