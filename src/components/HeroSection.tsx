import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useParallax } from '../hooks/useParallax'
import { asset } from '../lib/asset'
import SocialLinks from './SocialLinks'

export default function HeroSection() {
  const { profile } = usePortfolio()
  const { x, y } = useParallax()
  const [avatarOk, setAvatarOk] = useState(true)

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16"
    >
      {/* Ambient background glow, nudged by the pointer for depth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ transform: `translate(${x * 18}px, ${y * 18}px)` }}
      >
        <div className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),rgba(236,72,153,0.08)_40%,transparent_70%)] blur-3xl" />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="section-label mb-8"
      >
        {profile.role} · {profile.location}
      </motion.p>

      {/* Headline + avatar share a stacking context so the avatar bursts through. */}
      <div className="relative mx-auto flex w-full max-w-[1100px] items-end justify-center">
        <h1 className="hero-heading relative z-10 w-full overflow-hidden text-center">
          <span className="block text-[#8b8f96]">Hi, I&apos;m</span>
          <span className="block text-chrome">{profile.shortName}</span>
        </h1>

        {/* Avatar: slow head layer + a faster inner drift for a living feel. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(calc(-50% + ${x * 26}px), calc(-55% + ${y * 20}px))` }}
        >
          {avatarOk ? (
            <img
              src={asset(profile.avatar)}
              alt={profile.name}
              onError={() => setAvatarOk(false)}
              className="h-[clamp(14rem,34vw,30rem)] w-auto select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
              style={{ transform: `translate(${x * 10}px, ${y * 8}px)` }}
              draggable={false}
            />
          ) : (
            <div
              className="grid h-[clamp(12rem,26vw,22rem)] w-[clamp(12rem,26vw,22rem)] place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_25%,#2a2a2e,#0c0c0c)]"
              style={{ transform: `translate(${x * 10}px, ${y * 8}px)` }}
            >
              <span className="text-chrome text-7xl font-bold">
                {profile.shortName.charAt(0)}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mt-10 max-w-2xl text-center text-base leading-relaxed text-[#b9bcc2] sm:text-lg"
      >
        {profile.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10 mt-8"
      >
        <SocialLinks variant="pill" className="justify-center" />
      </motion.div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-[#6b6f76] transition-colors hover:text-white md:block"
      >
        <ArrowDown size={22} className="animate-bounce" />
      </a>
    </section>
  )
}
