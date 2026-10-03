# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Samyak confirmed that the site serves all four of these audiences. No priority order between them has been set.

- **Recruiters and hiring managers** screening for backend / fintech SDE2+ roles. They arrive from a resume or LinkedIn link and decide within a minute or two whether to reach out.
- **Engineers interviewing him.** Technical peers who read closely and judge system-design depth: idempotency, concurrency control, reconciliation, HSM and PCI-DSS work.
- **Freelance / consulting clients** looking for backend or payments help.
- **Peers and network.** Anyone who looks him up and wants a general picture of who he is and what he builds.

## Product Purpose

A single-page personal portfolio for Samyak Moon, a Backend Software Engineer at PayU Digital Labs in Bengaluru working on payment, card, and authentication systems in Java and Spring Boot.

It exists to turn the resume into something a visitor can evaluate in one visit: who he is, what he has owned, and how to reach him.

Success, inferred and not yet confirmed: the visitor contacts him (email, LinkedIn) or goes on to read his code on GitHub.

## Positioning

**End-to-end ownership** (confirmed). Samyak designs and owns whole workflows rather than tickets inside someone else's design. The proof is specific and named:

- Card Order Workflow: maker–checker approval, Quartz-based async scheduling, Visa and RuPay card generation, owned end to end.
- SecureAuthPro: a multi-tenant authentication and authorization service he designed.
- Wallet-to-Account (W2A) transfer API, including the async refund job for failed transactions.

Payments depth and measured outcomes support this claim; they are not the headline.

## Operating Context

- Visitors arrive from links on the resume PDF, LinkedIn, and GitHub.
- The resume is the source of truth for content. Three variants live in the repo root (see Evidence on Hand).
- Content is edited by changing `src/data/portfolio.json` only.
- The repo is `samyak2405/Samyak-s-3D-Portfolio-Website-`. It deploys to GitHub Pages on every push to `main`, and is also configured for Vercel.

## Capabilities and Constraints

**Stack (existing):** React 18, TypeScript, Vite 6, Tailwind CSS 3, React Three Fiber + drei + three (hero 3D, code-split), Framer Motion, lucide-react. Static SPA, no server runtime.

**Sections today:** Navbar, Hero (live WebGL distributed-systems graph), About (bio + metrics + toolkit), Experience, Expertise, Work (hidden while empty), Contact, Footer.

**Constraints**

- **JSON-first content.** All profile, skills, experience, project, service, education, and testimonial copy lives in `src/data/portfolio.json`, typed by `src/types/portfolio.ts` and read through `usePortfolio()`. Components do not hardcode content.
- **Empty data hides its UI.** Empty social links are not rendered. An empty `testimonials` array hides the whole section. The "Live Project" button appears only when `link` is set.
- **Subpath deploys.** GitHub Pages serves from `/<repo>/` via the `BASE_PATH` env var, so every public asset path must go through `src/lib/asset.ts`.
- **Real-time 3D hero.** The hero is a live WebGL distributed-systems graph (React Three Fiber): steel service nodes, hairline edges, and warm packets travelling the edges. It is lazy-loaded, pauses off screen, and degrades to a static backdrop under reduced-motion or without WebGL. (This supersedes the original plan's flat-portrait-with-parallax approach.)

**Open decisions**

- Priority order among the four audiences.
- Whether the Services section is a real freelance offer or a summary of skills. Freelance clients are a confirmed audience, but the offer itself (scope, availability, how to engage) is not defined.
- Whether a real avatar will be supplied (see Evidence on Hand).
- Which LinkedIn URL is correct (see Evidence on Hand).
- Whether a downloadable resume belongs on the site, and which variant.

## Brand Commitments

- Name: **Samyak Moon**; short name **Samyak**.
- Role line: Backend Software Engineer. Specialization: Fintech · Distributed Systems · Payments.
- Voice observed in existing copy, not confirmed as binding: first person, plain, technical, specific about mechanisms and numbers.

## Evidence on Hand

**Resumes (repo root).** Three variants, all dated March 2026:

- `Resume_Samyak_SDE2.pdf` and `Samyak_Resume_SDE2.pdf`: both PayU roles, no Projects section.
- `Resume-Samyak_SDE2.pdf`: only the current role, plus the Splitmoney project in four bullets.

**Facts the resumes support**

- Software Engineer, PayU Digital Labs, April 2025 to present.
- Associate Software Engineer, PayU Digital Labs, July 2023 to April 2025.
- Card generation time for 10K+ cards reduced by 85%; Extra Mile Award (individual contribution) for the Card Order Flow.
- SecureAuthPro supports 10+ enterprise clients.
- Atalla Payment HSM integration: 60% faster transaction processing than a general-purpose HSM.
- Card Adjustment and Card Replacement features: operational efficiency improved by 70%.
- Security hardening (CSP, CSRF, CORS, HSTS, TLS): audit-reported vulnerabilities reduced by 80%.
- Customer Segmentation with tier-based transactional fee rules.
- Splitmoney: Hyperswitch card/UPI payments, gRPC + Protobuf between services, equal / exact / percentage splits with SHA-256 idempotent creation, Transactional Outbox with RabbitMQ dead-letter queues and Redis deduplication.
- M.Tech CS, NIT Surathkal, 2021 to 2023. B.Tech CS, GCOE Amravati, 2016 to 2020.

**Links embedded in the resumes**

- GitHub: `https://github.com/samyak2405`
- Splitmoney repo: `https://github.com/samyak2405/Splitmoney-App-Backend`
- LeetCode: `https://leetcode.com/u/Dr_moon_knight/`
- LinkedIn: two resumes say `/in/samyakmoon/`, one says `/in/samyak-moon/`. Unresolved.
- Email `moon24samyak@gmail.com`, phone `+918551929114`.

**Unverified in `portfolio.json`** (reconciled against the resumes on 2026-10-03; these remain)

- LinkedIn is set to `/in/samyakmoon/`, the URL in two of the three resumes. Not confirmed by Samyak.
- The Splitmoney `link` points to `samyak2405/Splitmoney-App-Backend`, which is a private repo as of 2026-10-03, so visitors get a 404 until it is made public.
- Splitmoney `year` ("2024") and `role` ("Designer & Backend Engineer") appear in no resume. The repo was created in March 2026.
- "3+ years" is derived from the July 2023 start date; the resumes, written in March 2026, say 2.8+.

**Absent; do not fabricate**

- No avatar image. `public/avatar.png` does not exist and the hero shows a monogram fallback.
- No testimonials.
- No project screenshots or imagery.
- No clients, case studies, pricing, or availability for freelance work.
- No Open Graph image.

## Product Principles

1. **Ownership is the claim, so show whole systems.** Lead with a workflow he owned from design to production, with its mechanism and its result, before any list of tools.
2. **One page, two reading speeds.** A recruiter must get the answer in a minute; an interviewer must find the depth when they slow down. Neither should have to wade through the other's version.
3. **Only what the resume can back.** Every number, client count, and award traces to a resume. Missing evidence means the UI is absent, not filled in.
4. **Content lives in one file.** Updating the site means editing `portfolio.json`, never a component.
5. **Every visit can end in contact.** Reaching Samyak or his code should take one action from wherever the visitor stops reading.

## Accessibility & Inclusion

No formal standard has been set. The existing build commits to:

- Responsive layout from 375px to 1920px.
- Respecting `prefers-reduced-motion` for parallax, the marquee, and entrance animation.
- Semantic landmarks, labels on icon-only controls, and keyboard-reachable links.
