# Llanotecnica Website Overhaul Plan

**Starting state:** Angular 21.2.12 (just upgraded from 17), SSR enabled, `@ngx-translate` i18n with EN/ES URL mapping, ~300 translation keys per language, mobile LCP ≈ 8.4s, 2.1 GB assets folder.

**Non-negotiables**
- i18n must stay perfect — no broken translations, no broken Spanish URLs (`/sobre-nosotros`, `/productos`, `/contacto`), no broken hreflang/SEO behavior.
- All current content (copy, products, contact form fields, FAQs) preserved.
- `@ngx-translate/core` stays as the i18n engine — it works, it's wired through SSR, the language selector is solid. Replacing it would be a 2-week project for zero user-visible benefit.

**Targets after overhaul**
- Mobile LCP: < 2.5s (Core Web Vitals "good" threshold) — down from 8.4s
- Bundle: initial transfer < 150 KB gzip (currently ~208 KB)
- Lighthouse Performance: 90+ mobile, 95+ desktop
- Lighthouse SEO: 100 (already close — 100/100 per recent commit)
- Lighthouse Accessibility: 95+ (currently has gaps)
- Modern, professional B2B feel — Stripe / Linear / Apple-product-page tier, not flashy portfolio. This is industrial equipment for businesses.

---

## Phase 0 — Quick wins (1–2 days, near-zero risk)

These don't touch design or animation. Pure cleanup + perf.

| # | Task | Why | Files |
|---|---|---|---|
| 0.1 | **Audit & shrink `/assets/`** — identify oversized originals (4.6 MB JPEGs), regenerate proper WebP/AVIF variants, delete unused | The 2.1 GB folder is the LCP killer | `assets/photos/`, `optimize-media.sh` |
| 0.2 | Remove `aos` package (installed, never used) | Dead 30 KB dep | `package.json` |
| 0.3 | Remove `@fortawesome/fontawesome-free` (CSS already removed, package lingering) | Dead 6 MB dep | `package.json` |
| 0.4 | Switch `PreloadAllModules` → `withPreloading` w/ a quick-idle strategy | Currently preloads all 4 lazy chunks on startup, hurting initial paint | `src/app/app.config.ts:31` |
| 0.5 | Move hardcoded inquiry types in contact form into i18n | These render in English on the Spanish site today — actual i18n bug | `src/app/pages/contact/contact.component.ts:98-106`, `assets/i18n/*.json` |
| 0.6 | De-dupe `@font-face` declarations | Each font declared twice in styles.css — wasteful | `src/styles.css:3-67` and `:111-147` |
| 0.7 | Fix `LanguageSelectorComponent` unused import in `FooterComponent` | Pre-existing build warning | `src/app/components/footer/footer.component.ts:15` |

**Deliverable:** dependency cleanup, smaller asset bundle, all visible text translatable, faster initial parse. Single PR.

---

## Phase 1 — Design system foundation (2–3 days)

The site has good visual instincts (the green/yellow palette is on-brand for industrial) but no system — colors and spacing are hardcoded inline across 10+ files. We need tokens before we modernize anything visual, otherwise every change is a global find-and-replace.

### 1.1 Create design tokens layer

New file: `src/styles/_tokens.scss` (and a `:root` CSS-custom-properties counterpart for runtime theming).

**Tokens to define:**
- **Color** — `--color-brand-primary`, `--color-brand-primary-dark`, `--color-accent`, `--color-surface`, `--color-surface-elevated`, `--color-text-primary`, `--color-text-muted`, `--color-border`. Includes a `[data-theme="dark"]` set so dark mode is one switch away later (don't ship dark mode now).
- **Typography** — fluid clamp() scales: `--font-size-display`, `--font-size-h1`, `--font-size-h2`, `--font-size-body`, `--font-size-small`. Line-heights, weights, letter-spacing.
- **Spacing** — `--space-1` through `--space-16` on a consistent 4px scale. Replaces hardcoded `80px` section padding.
- **Radii** — `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`. Replaces inconsistent `8px` / `rounded-lg` mix.
- **Shadows** — `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow` (for green CTA hover).
- **Motion** — `--ease-out-expo`, `--ease-in-out-quart`, `--duration-fast`, `--duration-base`, `--duration-slow`. Plus `prefers-reduced-motion` overrides.

### 1.2 Refactor primitives

Three small standalone components that replace ad-hoc styles everywhere:
- `<lt-button variant="primary|secondary|accent|catalog">` — replaces 4 hand-rolled button classes in [home.component.css:49-121](frontend/llanotecnica-frontend/src/app/pages/home/home.component.css#L49)
- `<lt-section>` — wrapper that handles consistent vertical rhythm (replaces hardcoded `80px`)
- `<lt-card>` — for spec cards, FAQ items, value props

### 1.3 Material theme alignment

Material is barely used (Dialog + Button only) but its prebuilt `indigo-pink.css` doesn't match the brand at all. Define a custom Material 3 theme using the same brand tokens so the dialog feels native. [Optional — Material 3 migration is a v18+ feature we can opt into now.]

### 1.4 SVG icon migration (replace FontAwesome)

FontAwesome currently ships **~150 KB CSS + ~140 KB woff2 fonts** for the 29 distinct icons actually in use ([navbar/contact/home templates], discovered Phase 0.3). Replace with inline SVG icons (Lucide-style) — each icon is 1-2 KB inlined, total <30 KB savings ~250 KB.

- Build a small `<lt-icon name="…">` component that loads from a sprite OR inlines via Angular's `IconRegistry` (Material's pattern works without their CSS).
- Map the 29 FA icons to Lucide equivalents (almost all have direct matches).
- Once migration is done: remove `@fortawesome/fontawesome-free` from `package.json` AND `angular.json:33` global stylesheets.
- Side benefit: SVG icons inherit `currentColor`, so the new design system's color tokens apply automatically.

**Risk:** Touches every page's CSS. **Mitigation:** Land tokens first, then refactor one page at a time.

---

## Phase 2 — Performance (3–4 days)

Goal: 8.4s LCP → <2.5s. Order matters — image pipeline first, then bundle, then runtime.

### 2.1 Image pipeline rebuild

- **Hero (the LCP element):** generate sized AVIF + WebP variants at 480w / 780w / 1200w / 1920w. Inline a tiny base64 LQIP (low-quality image placeholder) in the SSR HTML so first paint shows blurred hero immediately. Use Angular's `NgOptimizedImage` with `priority` on hero.
- All other images → `NgOptimizedImage` with `loading="lazy"`, proper `width`/`height` for CLS, automatic srcset.
- Replace `optimize-media.sh` with a Node-based pipeline (`sharp`) that runs in `predeploy` — deterministic outputs, runs in CI.
- Delete oversized originals from `/assets/photos/` (4.6 MB JPEGs → 50 KB WebP equivalents).

### 2.2 Video strategy

The 1.6 GB `/assets/videos/` is the bigger asset hit but probably not LCP since it loads after hero. Action:
- Self-host MP4 (H.264) for compatibility + WebM (VP9 or AV1) for size.
- Generate poster image (already exists in pattern).
- `<video preload="none" poster="…">` so video bytes don't compete with hero.
- Consider streaming via Firebase Storage with proper Range headers.

### 2.3 Zoneless change detection (Angular 21 feature)

This is the big architectural unlock. Switch on `provideZonelessChangeDetection()` and remove `zone.js` from polyfills. Requires:
- Auditing 3 `NgZone.runOutsideAngular` usages (already explicit signals of zone awareness — easy convert)
- Auditing all `setTimeout`/`setInterval` (about 8 in the codebase) — change detection won't auto-fire after them; need explicit `signal.set()` or `markForCheck()`
- Converting any `Subject`-based component state to signals where natural

Expected gain: ~30-40% reduction in JS execution time on interaction, smaller polyfill bundle (zone.js is ~30 KB gzipped).

### 2.4 Deferrable views (`@defer`)

Use `@defer` blocks for below-the-fold sections — the FAQ, customer reviews, flag carousel, contact map. Each becomes its own chunk that only loads when scrolled near. Particularly impactful for the 53 KB `home.component.ts`.

### 2.5 Selective preloading

Replace `PreloadAllModules` with a custom strategy: preload the next likely route based on current page (home → products, products → contact). The `SelectivePreloadingStrategy` class already exists in the codebase — just unused.

### 2.6 Split monolith components

[home.component.ts:1-1500](frontend/llanotecnica-frontend/src/app/pages/home/home.component.ts) at 53 KB does video loading + scroll detection + flag carousel + feature filtering + FAQ + product comparison. Split:
- `<home-hero>` (own component, video + CTA logic)
- `<home-flag-carousel>` (`@defer` candidate)
- `<home-product-showcase>`
- `<home-faq>` (`@defer` candidate)
- `<home-stats>`
- `<home-reviews>` (`@defer` candidate)

Smaller components also unlock fine-grained `OnPush` and signal usage.

---

## Phase 3 — Animation & interaction (GSAP + smooth scroll) (3–5 days)

This is where the site goes from "fine" to "feels current." Tasteful, not flashy.

### 3.1 Tooling

- **GSAP** + **ScrollTrigger** (free, open-source — license check OK for commercial use as of GSAP 3.13 going fully MIT in 2025).
- **Lenis** for smooth-scroll (lightweight, 4 KB, framework-agnostic, plays nicely with ScrollTrigger).
- **`@angular/animations`** stays for in-component micro-animations (form errors, dropdowns) — the existing 6 triggers in `home.component.ts` keep working.
- **View Transitions API** for cross-route transitions (Angular 21 has first-class support via `withViewTransitions()`).

### 3.2 Specific animation wins (proposed)

| Where | What | Inspiration |
|---|---|---|
| **Hero** | Headline split into letters with stagger fade-up; product silhouette parallax on scroll; subtle SVG "circuit lines" drawing in | Stripe homepage hero |
| **Stats section** | Numbers count up when scrolled into view | Linear marketing |
| **Product showcase** | Pin section, scrub through MT-370 → MT-480 comparison as user scrolls; specs slide in from side | Apple product pages |
| **Flag carousel** | Currently a CSS auto-scroll — keep it but make it pause-on-hover smoother and respect `prefers-reduced-motion` | Generally acceptable as-is |
| **FAQ** | Expand/collapse with height auto + ease-out-expo, chevron 180° rotation | Vercel FAQ |
| **Section reveals** | Subtle fade-up + 8px translate on scroll-into-view, batched (not every element individually) | Linear |
| **Route transitions** | View Transitions API — fade + tiny scale crossfade on page change | Browser-native |
| **Cursor / hovers** | Magnetic effect on primary CTAs (subtle, ~6px max travel); border-glow pulse on hover | Subtle, not portfolio-flashy |

### 3.3 GSAP integration pattern

- Single `AnimationService` that wraps GSAP + ScrollTrigger, handles cleanup on route change, respects `prefers-reduced-motion` globally.
- Standalone directive `[ltReveal]` for declarative scroll-triggered fade-ups: `<div ltReveal="fade-up" delay="0.1">`.
- Lazy-load GSAP itself via `@defer (on viewport)` so the home hero doesn't pay for animation library bytes upfront.
- SSR-safe: all GSAP code guarded by `isPlatformBrowser()`.

### 3.4 Reduced motion

Mandatory. Every animation has a CSS `@media (prefers-reduced-motion: reduce)` fallback OR the AnimationService skips ScrollTrigger entirely. Non-negotiable for accessibility.

---

## Phase 4 — SEO polish (1–2 days)

Most of SEO is already excellent (per the recent "100/100 SEO score" commit). Remaining gaps:

| # | Task | Where |
|---|---|---|
| 4.1 | Translate JSON-LD FAQs — currently hardcoded English in [index.html:118-165](frontend/llanotecnica-frontend/src/index.html#L118) | `seo.service.ts` injects them dynamically per language |
| 4.2 | Add Product schema for MT-370 and MT-480 (price, availability, image, brand) | New `product-schema.service.ts` |
| 4.3 | Add LocalBusiness schema (already have address in Organization, just upgrade type) | `index.html:77-115` → service-driven |
| 4.4 | Add BreadcrumbList schema for nested pages | `seo.service.ts` |
| 4.5 | Consolidate the hreflang logic (currently duplicated across `seo-language.service.ts`, `sitemap.service.ts`, page components) | Single source of truth in `seo-language.service.ts` |
| 4.6 | Open Graph images per page (currently one site-wide OG image) | Generate per-page or use template |

---

## Phase 5 — Accessibility (1–2 days)

| # | Task | Where |
|---|---|---|
| 5.1 | Skip-to-content link (WCAG 2.4.1) | `app.component.html` |
| 5.2 | Focus trap inside language selector dropdown when open | `language-selector.component.ts:208-358` |
| 5.3 | Focus trap + restore on mobile menu open/close | `navbar.component.ts` |
| 5.4 | Add `<nav>`, `<main>`, `<footer>` semantic landmarks where missing | Layout shell |
| 5.5 | Verify all images have meaningful `alt` (or `alt=""` if decorative) — automate via lint | `eslint-plugin-jsx-a11y` Angular equivalent |
| 5.6 | `prefers-reduced-motion` global support (ties into Phase 3.4) | `AnimationService` + global CSS |
| 5.7 | Color contrast audit — verify yellow accent on white meets AA (likely fails for body text) | Global theme |

---

## Phase 6 — Architecture cleanup (2–3 days, optional but recommended)

Pure refactors — no user-visible change. Lower priority but pays dividends if the site grows.

| # | Task | Why |
|---|---|---|
| 6.1 | NgModule lazy routes (`home.module.ts`, `contact.module.ts`, `about-us.module.ts`, `product-section.module.ts`) → `loadComponent` standalone | Modern pattern, removes 6 NgModules |
| 6.2 | Replace 8× `toPromise()` with `firstValueFrom` | RxJS 8 will remove `toPromise()` entirely |
| 6.3 | Move hardcoded product data out of components into a `ProductsService` (or JSON file in `/assets/data/`) | Easier to update copy, makes products i18n-able later if needed |
| 6.4 | Add HTTP interceptor for caching translation files (or use `provideTransloco` if we ever migrate) | Cleaner data layer |
| 6.5 | Remove `app.config.ts.backup` and other dead backup files | Source hygiene |

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Image pipeline regenerates URLs and breaks deep links | Low | Keep filenames stable; only delete confirmed unused |
| Zoneless change detection misses an update somewhere | Medium | Land last in Phase 2 with full smoke-test pass; easy to revert |
| GSAP ScrollTrigger conflicts with Lenis on Safari iOS | Medium | Both libraries explicitly support each other; standard integration pattern; test on real device |
| View Transitions API not supported in older Safari | Low | Feature-detect, graceful fallback to no transition |
| Material 3 theme migration breaks Dialog styling | Low | Phase 1.3 is **optional** — punt if Phase 1 runs long |
| i18n key changes break translations mid-deploy | Low | All key changes go through both `en.json` and `es.json` in same PR; CI lint catches missing keys |

---

## Suggested execution order & timeline

1. **Phase 0 — Quick wins** (1–2 days) — biggest perf-per-effort
2. **Phase 1 — Design tokens** (2–3 days) — foundation for everything visual
3. **Phase 2 — Performance** (3–4 days) — hits the 8.4s LCP target
4. **Phase 3 — Animations** (3–5 days) — the "feels modern" payoff
5. **Phase 4 — SEO polish** (1–2 days)
6. **Phase 5 — Accessibility** (1–2 days)
7. **Phase 6 — Architecture cleanup** (2–3 days, can interleave)

**Total estimate:** 13–21 working days for the full overhaul. Phases 0–3 deliver 80% of the visible impact.

**Each phase = its own PR**, deployed and tested before the next starts. We don't merge a 3-week branch.

---

## Decisions (locked in 2026-05-07)

1. **Visual direction:** Heavy-equipment industrial. References: Caterpillar, John Deere, SANY, Komatsu, Volvo CE. Translates to:
   - **Palette:** deeper saturated brand green + machine grays (`#1a1a1a`, `#2d2d2d`, `#404040`) + safety-orange/yellow accents
   - **Typography:** Anton (already loaded) for display, Roboto Condensed for sub-display, Roboto for body, JetBrains Mono for spec callouts
   - **Borders/shapes:** small radii (max 4px), hard angles, blueprint-style technical motifs, optional notched corners on spec cards
   - **Motion:** weighty easing (`cubic-bezier(0.65, 0, 0.35, 1)`), slower durations (400-700ms not 200ms), no bounce/elastic
   - **UI patterns:** spec sheets styled as technical documentation, exposed grid lines on cards, hard directional shadows, monospace serial-number-style accents
2. **Scope:** all 6 phases.
3. **SSG (Static Site Generation):** **ADDED.** Switch from SSR to Angular 21 prerendering for all 8 routes (4 pages × 2 languages). Firebase Hosting serves prerendered HTML from CDN edge — no Cloud Function cold start, first byte is pure CDN latency. Contact form keeps using its existing Cloud Function for POST submissions. Slotted into Phase 2.
4. **Hero video upgrade:** **APPROVED post-Phase-2.** Re-encode to AV1 with multiple resolutions (720p mobile / 1080p desktop / 4K retina). With LQIP poster + `preload="none"` + intersection-based load, the LCP element becomes the poster image (sharp WebP, ~30 KB), not the video — so video can be higher quality without hurting LCP.
5. **Deploy cadence:** Each phase = its own PR, staged on a Firebase preview channel for visual QA, then promoted to prod. No 3-week feature branch.
6. **GSAP license:** Free tier (core + ScrollTrigger + SplitText, all MIT as of GSAP 3.13).
7. **Dark mode:** Token system will support it (foreground/background tokens are theme-agnostic). Ship later, not now — visual QA budget is finite.
