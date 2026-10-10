# Samyak Moon — Portfolio

A personal portfolio for **Samyak Moon**, a backend / full-stack software engineer
(Java, Spring Boot, distributed systems, and AI/RAG). A single-page site with a
**Spider-Man night** theme: a navy-black night sky, suit-red and suit-blue accents,
spider-web strands, comic-print halftone and a night-city skyline, with Spider-Man
hanging from a web thread who drops down the page as you scroll.

**Live:** https://samyak2405.github.io/samyak-moon-portfolio/

## Highlights

- **Spider-Man night theme** — navy-black surfaces with suit-red (primary) and
  suit-blue (secondary) accents used sparingly, monospace headings, and original
  backdrop art: corner spider webs that spin themselves in as each section enters,
  comic halftone, a moon, and a generated night-city skyline. Signature touches: a
  blinking terminal cursor, `// code-comment` section labels, and an "active quest"
  glow on the current role.
- **Scroll-driven Spider-Man** — he hangs on a web thread in the right gutter and
  descends with page progress, swings like a pendulum when the scroll speed changes,
  and zips you back to the top on click (desktop, `lg`+; parked under reduced motion).
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
- **Skills**: items with `"recent": true` get the blue "new" treatment.

## Background art

- **Webs** — [`WebBackdrop`](src/components/fx/WebBackdrop.tsx) generates an orb web
  (spokes + sagging rings) from a seed and strings it from a section corner. Pick the
  corner, size, strength and seed per section.
- **Skyline** — [`Skyline`](src/components/fx/Skyline.tsx) generates a night city
  (far haze, near silhouettes with setbacks/spires/water tanks, sparse lit windows)
  as a handful of SVG paths.
- **Spider-Man** — [`SpiderDrop`](src/components/ui/SpiderDrop.tsx) plus
  `public/spidey.webp` (a transparent cutout, ~22 KB).

## Project structure

```
index.html                 # entry HTML, fonts, meta/OG tags, theme-color
vercel.json                # Vercel: vite framework + SPA rewrite
public/
  spidey.webp              # Spider-Man cutout for the scroll descent
  favicon.svg  robots.txt
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
    asset.ts  cn.ts  gsap.ts  icons.ts  rng.ts
  components/
    layout/   Navbar.tsx
    fx/       WebBackdrop.tsx  Skyline.tsx
    ui/       SpiderDrop.tsx  Counter.tsx  ExperienceCard.tsx  ProjectCard.tsx
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
  focus rings, decorative art marked `aria-hidden`, and keyboard-reachable
  navigation.
- Background art is generated SVG (no image requests); the only bitmap is the
  22 KB Spider-Man cutout.

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
