# Samyak Moon — 3D Personal Portfolio

A polished, fully responsive single-page portfolio for **Samyak Moon**, a Backend
Software Engineer working in fintech, distributed systems, and payments.

The "3D" is the guide-faithful visual signature: a Pixar-style rendered avatar that
**bursts through** the hero headline, with **layered cursor parallax** so the scene feels
alive — no heavyweight WebGL. Every piece of content is read from a single typed JSON file,
so updating the site never means touching a component.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS 3** (design tokens)
- **Framer Motion** (scroll/entrance animation)
- **lucide-react** (icons)
- Fonts: **Kanit** + **JetBrains Mono** (Google Fonts)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build locally
npm run typecheck # type-check only (tsc --noEmit)
```

Requires Node 18+ (developed on Node 22).

## Editing content — one file

**All** profile, skills, experience, project, service, education, and testimonial content
lives in [`src/data/portfolio.json`](src/data/portfolio.json). Components never hardcode
copy — they read the JSON through the typed [`usePortfolio()`](src/hooks/usePortfolio.ts)
hook, shaped by [`src/types/portfolio.ts`](src/types/portfolio.ts).

To change anything on the site, **edit `portfolio.json`**. A few behaviors to know:

- **Empty social links are hidden** — leave `instagram`/`website` as `""` and they won't render.
- **Testimonials**: an empty `testimonials: []` array hides the entire section (the site never
  fakes testimonials). Add objects to show the auto-scrolling marquee.
- **Projects**: set `"highlight": true` to sort a project first and show a "Featured" badge.
  The "Live Project" button only appears when `link` is non-empty; a missing `image` falls back
  to a titled dark placeholder.
- **Experience**: the first 3 highlights show by default, with a "Show more" toggle.

## The avatar

The hero expects a Pixar-style, background-removed portrait at **`public/avatar.png`**
(pointed to by `profile.avatar` in the JSON). Until you add one, the hero shows a tasteful
chrome-gradient monogram fallback, so the site is complete and deployable without it.

To add the real avatar:

1. Generate a Pixar-style 3D head-and-shoulders portrait on a solid deep-black background
   (keep the phrase *"Pixar-style aesthetic"* in the prompt), personalized to Samyak.
2. Remove the background and export a transparent PNG.
3. Save it as `public/avatar.png`. It picks up the layered cursor parallax automatically.

## Project structure

```
index.html                 # entry HTML, fonts, meta/OG tags
vercel.json                # Vercel: vite framework + SPA rewrite
public/
  favicon.svg              # brand monogram favicon
  avatar.png               # (add) Pixar-style avatar — hero shows a fallback until then
src/
  main.tsx                 # React entry
  App.tsx                  # section composition
  index.css                # Tailwind layers, chrome gradient, marquee, reduced-motion
  types/portfolio.ts       # TypeScript interfaces for the JSON
  data/portfolio.json      # ALL site content
  hooks/
    usePortfolio.ts        # typed content accessor
    useParallax.ts         # smoothed, reduced-motion-aware cursor parallax
  components/
    Navbar.tsx  SocialLinks.tsx  HeroSection.tsx  AboutSection.tsx
    ExperienceSection.tsx  ServicesSection.tsx  ProjectsSection.tsx
    ProjectCard.tsx  TestimonialsSection.tsx  Footer.tsx
```

## Accessibility & responsiveness

- Fully responsive — validated at 375 / 768 / 1280 / 1920 px.
- Respects `prefers-reduced-motion`: parallax, the testimonial marquee, and entrance
  animations all stand down.
- Semantic landmarks, `aria-label`s on icon-only controls, and keyboard-reachable links.

## Deployment (Vercel)

The app is a static SPA — no server runtime needed.

1. Push to GitHub and import the repo in Vercel (it auto-detects Vite via `vercel.json`).
2. Build command `npm run build`, output directory `dist` — already configured.
3. The SPA rewrite in `vercel.json` routes all paths to `index.html`.

Any static host works too: run `npm run build` and serve the `dist/` folder.
