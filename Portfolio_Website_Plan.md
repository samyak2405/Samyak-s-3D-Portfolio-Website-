# Samyak Moon — 3D Personal Portfolio

## Context

Samyak wants a personal "3D" portfolio website. He provided his resume (`Resume-Samyak_SDE2.pdf`)
and a reference prompt guide (`Building-A-Portfolio-With-AI-Prompt-Guide.pdf`). The guide prescribes
a specific, proven architecture: a single-page, JSON-first portfolio where the "3D" is a
**Pixar-style rendered avatar** that bursts through the hero headline with **layered cursor parallax**
— not real WebGL (the guide's "What Didn't Work" section documents real-3D/SVG-vectorization as a
dead end).

**Confirmed decisions:** Guide-faithful 3D (styled avatar + parallax) · AI-generated avatar ·
Vite + React 18 + TypeScript · deploy to Vercel.

The current folder is greenfield — only the PDFs plus stale, empty `.next/` and `.idea/` folders
(no `package.json`, no source). Node 24 / npm 11 are available. The stale `.next/` will be left
as-is (ignored); Vite does not use it.

**Outcome:** A polished, fully responsive single-page portfolio that reads 100% of its content from
one typed JSON file, with Samyak's real resume content wired in, and a clean `npm run build` ready
for Vercel.

## Tech stack & design tokens (from the guide)

- **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · lucide-react
- **Background:** `#0C0C0C`
- **Headline gradient (chrome):** `linear-gradient(180deg, #646973 0%, #BBCCD7 100%)`
- **Accent gradient:** purple → magenta → orange (buttons / highlights)
- **Font:** Kanit (Google Fonts)

## Architecture — JSON-first (non-negotiable per guide)

Every piece of profile/experience/project/testimonial/skill content lives in
`src/data/portfolio.json`. Components read it through a typed `usePortfolio()` hook and
`src/types/portfolio.ts` — **no hardcoded content strings in components** (Services included, which
the guide originally hardcodes; we put it in JSON from the start).

## Project structure

```
samyak_portfolio/
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  tsconfig.json  (+ tsconfig.node.json)
  vercel.json                      # SPA rewrite + build command
  README.md
  public/
    avatar.png                     # AI-generated Pixar-style avatar (bg-removed)
  src/
    main.tsx
    App.tsx
    index.css                      # Tailwind layers + .hero-heading, marquee keyframes, reduced-motion
    types/portfolio.ts             # TS interfaces for the JSON
    data/portfolio.json            # ALL content (Samyak's resume)
    hooks/usePortfolio.ts          # typed accessor hook
    hooks/useParallax.ts           # cursor-follow parallax values (layered easing)
    components/
      Navbar.tsx
      SocialLinks.tsx
      HeroSection.tsx
      AboutSection.tsx
      ExperienceSection.tsx
      ServicesSection.tsx
      ProjectsSection.tsx
      ProjectCard.tsx
      TestimonialsSection.tsx
      Footer.tsx
```

## Data model (`src/types/portfolio.ts` → `portfolio.json`)

Mirrors the guide's schema, extended with `skills` and `services`:

- `profile`: name, shortName, tagline, role, specialization, location, yearsOfExperience, bio,
  avatar, social{ github, linkedin, leetcode, email, phone, instagram, website } — empty links hidden
- `skills.categories[]`: { name, items[] }
- `services[]`: { title, description, icon } (moved to JSON; guide hardcodes it)
- `experience[]`: { company, role, period, location, summary, highlights[] }
- `projects[]`: { id, title, subtitle, description, stack[], role, year, link, image, highlight }
- `education[]`: { degree, institution, period }
- `testimonials[]`: empty `[]` → section renders nothing (guide: never fake testimonials)

### Content mapped from the resume

- **Profile:** Samyak Moon · "Samyak" · Backend Software Engineer · "Fintech · Distributed Systems ·
  Payments" · Bengaluru, Karnataka, India · "2.8+" yrs · bio from the professional summary.
  Social: GitHub, LinkedIn, Leetcode, email `moon24samyak@gmail.com`, phone `+918551929114`.
  instagram/website left empty (auto-hidden).
- **Experience (01):** PayU Digital Labs — Software Engineer — "April 2025 – Present" — Bengaluru.
  Highlights = the 6 resume bullets (Card Order Workflow 85% faster, SecureAuthPro multi-tenant
  auth, W2A transfer API, Authorization/Settlement flows, Atalla HSM 60% faster, 2FA MPIN+OTP).
  Section shows first 3 by default (per guide).
- **Projects:** Splitmoney (real-time expense splitting; stack: gRPC, Protobuf, RabbitMQ, Redis,
  Hyperswitch, microservices; GitHub link; `highlight: true`).
- **Services:** Backend & Distributed Systems · Payments & Security (PCI-DSS, HSM, JWT/RBAC) ·
  Cloud & DevOps (AWS, Jenkins, CI/CD) · AI-Powered Development (Cursor, LLM tooling).
- **Skills:** the 7 resume categories (Programming, Backend & Distributed Systems, Databases &
  Storage, Cloud & DevOps, Messaging & Streaming, Observability & Monitoring, AI Tools).
- **Education:** M.Tech CS — NIT Surathkal (2021–2023); B.Tech CS — GCOE Amravati (2016–2020).

> Note: the resume lists only PayU under Experience; the JSON makes it trivial to add prior roles
> later. A couple of extra projects (e.g. SecureAuthPro) can be promoted from work items if Samyak
> wants a fuller Projects grid — flagged, not assumed.

## Sections (build in this order, guide-faithful)

1. **Hero** — full viewport, CSS-Grid layout (rows: nav / avatar / tagline). Chrome-gradient
   `Hi, I'm Samyak`, headline uses `font-size: clamp(3rem, 13vw, 14rem)`, `white-space: nowrap`,
   container `overflow: hidden` as a clip safety net. Avatar spans grid rows 2–3 with `z-index`
   above the headline → "bursting through the title" effect. Social pill row (empty links hidden).
   Validate at 375 / 768 / 1280 / 1920 px.
2. **Navbar** — HOME, ABOUT, SKILLS, PROJECTS, CONTACT; smooth scroll; `scroll-margin-top: 80px`.
3. **About** — headline + bio from JSON; `overflow-wrap: normal; word-break: normal` (no mid-word
   wrapping — the guide's hard-won lesson).
4. **Experience** — numbered 01/02/03 rows; company·role, period as monospace pill, summary, first
   3 highlights, dividers.
5. **Services** — same numbered design; from JSON.
6. **Projects** — sticky dark cards; `highlight:true` sorted first; "Live Project" button hidden
   when `link` empty; image fallback to dark placeholder with title overlay.
7. **Testimonials** — CSS-only infinite right-to-left marquee, pause on hover, respects
   `prefers-reduced-motion`; **entire section hidden when `testimonials.length === 0`** (current case).
8. **Footer** — 3-col grid (stacked on mobile): brand (chrome-gradient name + specialization +
   location) · NAVIGATE (anchor links) · REACH OUT (email with copy button + phone + SocialLinks).
   Bottom strip: divider, copyright left, build credit right.

## The 3D avatar (guide's visual signature)

1. **Generate** a Pixar-style 3D head-and-shoulders portrait via an image-generation skill using the
   guide's template prompt, personalized for Samyak (skin/hair/eye color, hairstyle, optional facial
   hair, solid deep-black background). Keyword **"Pixar-style aesthetic"** is kept verbatim (guide
   warns alternatives produce inconsistent results). Confirm the generated image with Samyak before
   wiring it in.
2. **Background-remove** and save to `public/avatar.png`.
3. **Layered cursor parallax** (`useParallax.ts`): different easing per layer so motion feels alive
   (guide: pupils fast, eyes medium, head slow). Since we use a single flat PNG (not a layered SVG —
   the guide's dead-end warning), parallax is applied as subtle multi-speed transform on the avatar +
   a soft glow/shadow layer, gated by `prefers-reduced-motion`.

## CSS specifics (`src/index.css`)

- `.hero-heading` chrome gradient via `background-clip: text` + `-webkit-text-fill-color: transparent`.
- `html { scroll-behavior: smooth; }`
- Testimonial marquee keyframes + `@media (prefers-reduced-motion: reduce)` disabling marquee/parallax.
- Explicit `overflow-wrap: normal; word-break: normal` on body paragraphs.

## Deployment (Vercel)

- `vercel.json`: framework `vite`, build `npm run build`, output `dist`, SPA rewrite to `/index.html`.
- Static SPA — no server runtime needed.

## Build approach (staged, per the guide's key lesson)

Scaffold and wire in stages, confirming the hero renders before building the rest — this catches
misinterpretations cheaply rather than generating everything blind:

1. Vite + TS + Tailwind scaffold; design tokens; Kanit font; `types` + `portfolio.json` + hooks.
2. Hero + Navbar + SocialLinks (the visual signature) — **confirm with Samyak**, then continue.
3. Generate + wire the avatar — **confirm the image**, then continue.
4. About, Experience, Services.
5. Projects + ProjectCard, Testimonials (hidden), Footer.
6. Responsive polish (375/768/1280/1920), reduced-motion, README, production build, Vercel config.

## Verification

- `npm run dev` — visually verify hero, parallax, smooth-scroll nav, all sections at
  375 / 768 / 1280 / 1920 px (use `chrome-devtools-cli` skill for automated screenshots).
- Confirm: no mid-word wrapping in About; headline never clips; empty social links hidden;
  Testimonials section absent (empty array); Projects "Live" button hidden when link empty.
- `npm run build` + `npm run preview` — production build succeeds and serves cleanly.
- `tsc --noEmit` — no type errors (components only read typed JSON, no hardcoded content).
- README documents install, scripts, structure, and "edit `portfolio.json` to change content".

