# Samyak Moon — Portfolio

A personal portfolio for **Samyak Moon**, a backend / full-stack software engineer
(Java, Spring Boot, distributed systems, and AI/RAG). A single-page site with a
**gamer + coder** aesthetic: a dark, IDE-at-night feel with restrained neon, a
friendly 3D cartoon character who guides each section, and buttery smooth scrolling.

**Live:** https://samyak2405.github.io/samyak-moon-portfolio/

## Highlights

- **Gamer/coder dark theme** — deep near-black surfaces, electric-blue + magenta
  neon used sparingly (glows, active states, key words), monospace headings, and a
  faint IDE grid. Signature touches: a blinking terminal cursor, `// code-comment`
  section labels, and an "active quest" glow on the current role.
- **A 3D character guide** — a rim-lit cartoon render per section (wave, presenting,
  coding at the desk, thinking, thumbs-up) that enters on scroll and drifts with
  parallax.
- **Content as visuals** — an interactive skills grid (grouped, with the newest
  skills flagged), an expandable **"play card"** timeline with glassmorphism, animated
  count-up stats, schematic system diagrams, and expandable project cards.
- **Smooth, cinematic scroll** — Lenis inertial scrolling driven through GSAP
  ScrollTrigger, with scroll-reveals and light parallax.
- **Fast and accessible** — mobile Lighthouse ≈ Performance 90+, Accessibility 100,
  Best Practices 100, SEO 100. Everything respects `prefers-reduced-motion` and
  `prefers-reduced-transparency`.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS 3** (design tokens)
- **Lenis** (smooth scroll) + **GSAP** / ScrollTrigger (scroll-driven animation)
- **Framer Motion** (component micro-interactions, reveals, card expand/collapse)
- **lucide-react** (icons)
- Fonts: **JetBrains Mono** (headings/labels/code) + **Hanken Grotesk** (body)

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run typecheck # type-check only (tsc --noEmit)
```

Requires Node 18+.

## Editing content — one file

**All** profile, metrics, skills, experience, service, and project content lives in
[`src/data/portfolio.json`](src/data/portfolio.json), typed by
[`src/types/portfolio.ts`](src/types/portfolio.ts) and read through the
[`usePortfolio()`](src/hooks/usePortfolio.ts) hook. Components never hardcode copy —
to change anything on the site, edit `portfolio.json`.

A few behaviors to know:

- **Empty data hides its UI.** Empty social links aren't rendered; an empty
  `projects: []` array hides the Work section.
- **Experience**: the entry with `"active": true` becomes the top, glowing "NOW" node
  and opens by default.
- **Skills**: items with `"recent": true` get the magenta "new" treatment.

## Character art

The guide is a set of pre-rendered 3D images on a dark spotlight backdrop that
matches the theme. They are **not** cut out — the backdrop is kept and the edges are
feathered so each image blends into the page with no visible box.

- Source PNGs live in `characters-src/` (gitignored; not shipped).
- [`scripts/process-characters.py`](scripts/process-characters.py) paints out the
  watermark, crops a head-centered portrait, resizes, feathers the edges, and encodes
  WebP into `public/characters/` (what the site ships, ~260 KB total). Requires
  Pillow (`pip install Pillow`); re-run after adding or replacing a pose.

## Project structure

```
index.html                 # entry HTML, fonts, meta/OG tags, theme-color
vercel.json                # Vercel: vite framework + SPA rewrite
public/
  characters/*.webp        # optimized character art (shipped)
  favicon.svg  robots.txt
scripts/process-characters.py
src/
  main.tsx                 # React entry
  App.tsx                  # section composition + smooth scroll
  index.css                # theme tokens, ambiance, glass, cursor, neon helpers
  types/portfolio.ts       # TypeScript interfaces for the JSON
  data/portfolio.json      # ALL site content
  hooks/
    usePortfolio.ts        # typed content accessor
    useSmoothScroll.ts     # Lenis + GSAP ticker/ScrollTrigger wiring
    useGsap.ts             # scoped, reduced-motion-aware GSAP helper
    useScrollSpy.ts        # IntersectionObserver nav highlighting
  lib/
    asset.ts  cn.ts  gsap.ts  icons.ts
  components/
    layout/   Navbar.tsx
    ui/       Character.tsx  Counter.tsx  ExperienceCard.tsx  ProjectCard.tsx
              MagneticLink.tsx  Reveal.tsx  SectionHeading.tsx  Statement.tsx
    diagrams/ DiagramPanel.tsx  primitives.tsx  PaymentFlowDiagram.tsx
              CardSecurityDiagram.tsx  TopologyDiagram.tsx
    sections/ Hero.tsx  About.tsx  Skills.tsx  Experience.tsx  Systems.tsx
              Expertise.tsx  Work.tsx  Contact.tsx
```

## Accessibility & performance

- Single dark theme with WCAG AA contrast (verified for neon-on-dark).
- `prefers-reduced-motion`: smooth scroll, GSAP/Framer reveals, the cursor, and
  parallax all stand down to static. `prefers-reduced-transparency`: glass surfaces
  fall back to solid.
- Semantic landmarks, a skip link, `aria-expanded` on the interactive cards, visible
  focus rings, meaningful alt text on the character images, and keyboard-reachable
  navigation.
- Character art ships as small WebP; off-screen poses load lazily.

## Deployment

Static SPA — no server runtime. Builds from root (`base: /`) for local, preview, and
Vercel; the GitHub Pages workflow overrides `base` to the repo subpath via `BASE_PATH`.

### GitHub Pages (automated)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) type-checks, builds,
and publishes to GitHub Pages on every push to `main`. One-time setup: **Settings →
Pages → Source → GitHub Actions**. Publishes to `https://<user>.github.io/<repo>/`.

### Vercel

Import the repo (auto-detected via `vercel.json`); build `npm run build`, output
`dist`, with an SPA rewrite to `index.html`. Any static host works: run
`npm run build` and serve `dist/`.
