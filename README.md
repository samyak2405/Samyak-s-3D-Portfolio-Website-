# Samyak Moon — 3D Personal Portfolio

A polished, fully responsive single-page portfolio for **Samyak Moon**, a Backend
Software Engineer working in fintech, distributed systems, and payments.

The "3D" is real WebGL: the hero renders a live **distributed-systems graph** — steel
service nodes connected by hairline edges, with warm packets travelling the edges like
payments and events moving through a platform. It is the one visual idea of the site and
it maps directly to the work. The scene eases toward the cursor, idles when it scrolls
off screen, and collapses to a static backdrop under reduced-motion or if WebGL is
unavailable.

Everything else is calm and typographic: a single dark theme, cool-steel structure, and
one locked **amber** accent. All content is read from a single typed JSON file, so
updating the site never means touching a component.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS 3** (design tokens)
- **React Three Fiber** + **drei** + **three** (the hero 3D scene, code-split)
- **Framer Motion** (scroll reveals, magnetic CTAs, 3D tilt — all motion-value based)
- **lucide-react** (icons)
- Fonts: **Bricolage Grotesque** (display/UI) + **JetBrains Mono** (data/labels), Google Fonts

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
npm run typecheck # type-check only (tsc --noEmit)
```

Requires Node 18+.

## Editing content — one file

**All** profile, metrics, skills, experience, project, service, and education content
lives in [`src/data/portfolio.json`](src/data/portfolio.json). Components never hardcode
copy — they read the JSON through the typed [`usePortfolio()`](src/hooks/usePortfolio.ts)
hook, shaped by [`src/types/portfolio.ts`](src/types/portfolio.ts).

To change anything on the site, **edit `portfolio.json`**. A few behaviors to know:

- **Empty data hides its UI.** Empty social links (`instagram`/`website`) don't render;
  an empty `projects: []` array hides the Work section entirely.
- **Projects**: the project with `"highlight": true` is featured; the "View repository"
  button only appears when `link` is non-empty.
- **Metrics**: the `metrics` array drives the figures in the About section.

## The 3D scene

The hero scene lives in [`src/three/`](src/three) and is lazy-loaded, so three.js never
blocks first paint:

- [`graph.ts`](src/three/graph.ts) — pure, seeded generator for the node/edge/packet
  geometry (no magic numbers in the components).
- [`SystemGraph.tsx`](src/three/SystemGraph.tsx) — instanced nodes, edges, and animated
  packets; pointer-eased rotation; freezes to one frame under reduced-motion.
- [`HeroCanvas.tsx`](src/three/HeroCanvas.tsx) — the R3F `<Canvas>`: capped DPR, depth
  fog, lighting, and a render loop that idles when the hero is off screen.
- [`CanvasMount.tsx`](src/three/CanvasMount.tsx) — lazy load, in-view pausing, and an
  error boundary that falls back to a static backdrop.

## Project structure

```
index.html                 # entry HTML, fonts, meta/OG tags
vercel.json                # Vercel: vite framework + SPA rewrite
public/favicon.svg         # brand monogram favicon
src/
  main.tsx                 # React entry
  App.tsx                  # section composition + skip link
  index.css                # design tokens, base styles, utilities
  types/portfolio.ts       # TypeScript interfaces for the JSON
  data/portfolio.json      # ALL site content
  hooks/
    usePortfolio.ts        # typed content accessor
    useScrollSpy.ts        # IntersectionObserver-based nav highlighting
    useInView.ts           # pauses the 3D loop when the hero is off screen
  lib/
    asset.ts               # base-path-aware public asset resolver
    cn.ts                  # class-name join helper
    icons.ts               # maps service icon names -> lucide components
  three/                   # the hero 3D scene (see above)
  components/
    layout/   Navbar.tsx  Footer.tsx
    ui/       Reveal.tsx  SectionHeading.tsx  MagneticLink.tsx  TiltCard.tsx  SocialLinks.tsx
    sections/ Hero.tsx  About.tsx  Experience.tsx  Expertise.tsx  Work.tsx  Contact.tsx
```

## Accessibility & responsiveness

- Single dark theme; responsive from small phones to large desktops.
- Respects `prefers-reduced-motion`: the 3D scene, scroll reveals, magnetic CTAs, and the
  card tilt all stand down to static.
- Semantic landmarks, a skip link, `aria-label`s on icon-only controls, visible focus
  rings, and keyboard-reachable navigation.

## Deployment

The app is a static SPA — no server runtime needed. It builds from root (`base: /`)
for local, preview, and Vercel; the Pages workflow overrides `base` to the repo
subpath via the `BASE_PATH` env var.

### GitHub Pages (automated)

A workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) type-checks,
builds, and publishes to GitHub Pages on every push to `main` (and on manual dispatch).

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**. The site
then publishes to `https://<user>.github.io/<repo>/`.

### Vercel

1. Import the repo in Vercel (it auto-detects Vite via `vercel.json`).
2. Build command `npm run build`, output directory `dist` — already configured.
3. The SPA rewrite in `vercel.json` routes all paths to `index.html`.

Any static host works too: run `npm run build` and serve the `dist/` folder.
