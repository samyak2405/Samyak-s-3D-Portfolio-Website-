import { useReducedMotion } from 'framer-motion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Systems from './components/sections/Systems'
import Expertise from './components/sections/Expertise'
import Work from './components/sections/Work'
import Contact from './components/sections/Contact'
import SpiderDrop from './components/ui/SpiderDrop'

export default function App() {
  const reduce = useReducedMotion()
  useSmoothScroll(!reduce)

  return (
    <div className="min-h-screen bg-ink text-steel-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Systems />
        <Expertise />
        <Work />
        <Contact />
      </main>
      <SpiderDrop />
      <div aria-hidden className="grain" />
    </div>
  )
}
