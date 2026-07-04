---
name: HamroGhar
description: A stamped, verified rental marketplace for Nepal — warm-ink and terracotta presentation, no brokers, no middlemen.
colors:
  warm-ink: "#2B211A"
  warm-ink-darkest: "#1A1410"
  warm-ink-pale: "#F3EFEB"
  terracotta: "#B4522F"
  terracotta-bright: "#C97850"
  terracotta-deep: "#7D3720"
  terracotta-pale: "#FBF1EC"
  slate-gray: "#64748B"
  hairline-slate: "#E2E8F0"
  warning-amber: "#F59E0B"
  urgent-red: "#EF4444"
  hostel-purple: "#9333EA"
typography:
  display:
    fontFamily: "Outfit, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.02em"
    lineHeight: 1.12
  body:
    fontFamily: "Outfit, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "28px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
  button-secondary:
    backgroundColor: "{colors.terracotta-pale}"
    textColor: "{colors.terracotta-deep}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.lg}"
---

# Design System: HamroGhar

## 1. Overview

**Creative North Star: "The Verified Stamp" (warm revision)**

Revised 2026-07-03 (third pass, same day): the premium navy-and-gold system read as cold and boardroom-formal on a second look — striking, but not "warm to the eyes," which is the brief for this revision. The fix is not a literal pale-cream background (this doc has banned that exact AI-default since day one, and still does — see below), it's re-tuning the two colors that were doing the work: navy becomes a warm espresso ink, and gold becomes a grounded terracotta pulled from Kathmandu Valley fired-brick architecture. The signature stamp badge, the masonry showcase, the scroll reveals, and the mono/sans type pairing are all unchanged — this is a re-tint, not a re-design.

This system still explicitly rejects the generic AI-SaaS template: no cream/sand PAGE-CANVAS backgrounds, no gradient text, no glassmorphism used decoratively, no hero built around an abstract metric widget. Warmth here comes from the ink and accent hues themselves (both now warm-toned) plus imagery, not from tinting the page background toward cream — that would just trade one 2026-AI-default (navy+gold) for a more common one (pale cream + serif + terracotta), which is exactly the look this doc's own calibration notes warn against.

**Key Characteristics:**
- Warm Ink grounds the surface — dark section backgrounds, primary text/ink, structural weight. Same job navy did, warmer hue (espresso/near-black-brown instead of cold navy-black).
- Terracotta is the one rare accent — primary CTAs, the verification stamp, featured/premium markers. Same restraint rule as gold had: ubiquity would read cheap, not elevated.
- Masonry-grid property showcases (CSS columns, `break-inside-avoid`) — unchanged from the premium revision.
- Scroll-triggered reveals (Intersection Observer, progressive enhancement — content is never hidden if JS fails) — unchanged.
- A geometric-sans + monospace type pairing persists unchanged: Outfit carries voice and hierarchy, JetBrains Mono carries data and proof.

## 2. Colors

The palette is Committed: warm ink carries structural weight and dark surfaces; terracotta is reserved for the rare, meaningful accent (primary actions, verification, premium markers). Same commitment level as the navy+gold revision — only the hue temperature changed, not the strategy.

### Primary
- **Warm Ink** (#2B211A): Primary text color, ink (`text-blue-900` in code — the Tailwind `blue` key is repointed to this warm-ink scale, so every existing `blue-*` usage across the app inherited the new hue with no per-file renames). Contrast-verified well above 15:1 against white.
- **Warm Ink Darkest** (#1A1410): Hero showcase gradient start, CTA section, membership dashboard banner — the "dark surface" moments that used to be navy-black are now espresso-black.
- **Warm Ink Pale** (#F3EFEB): The palest step of the ink scale — used for borders/tints that need to feel ink-adjacent without being dark. This is warmer than the old navy-pale, but it is a *component* tint (borders, chip backgrounds), never the page canvas — see the cream ban below.

### Accent
- **Terracotta** (#B4522F / bright variant #C97850): The one rare accent. Primary buttons paired with **white text** — this is the opposite pairing from the old gold, which needed dark text (gold-on-white failed contrast at 2.4–3.6:1). Terracotta-500 is dark enough that white text passes at 5.01:1, so buttons read cleaner with no double-check needed per shade. Also used for the verification stamp, featured/premium badges, focus rings, price tags. Same restraint rule as before: if terracotta starts appearing on every icon and every line of body text, it has stopped being premium and started being loud.
- **Terracotta Deep** (#7D3720): Hover state for terracotta buttons; text/icon color on the rare occasion terracotta needs to sit directly on white as text rather than as a button fill.
- **Terracotta Pale** (#FBF1EC): Tint background for secondary buttons and badge chips — a *component-scoped* warm tint, not a page-wide cream wash (see Don'ts).

### Neutral
- **Slate Gray** (#64748B): Secondary/meta text — timestamps, view counts, helper copy. Unchanged.
- **Hairline Slate** (#E2E8F0): Card borders, dividers, input borders at rest. Unchanged.
- Page background stays a true neutral white/near-white (`bg-slate-50` / `#f8fafc`, unchanged from every prior revision). Warmth comes from ink + terracotta + imagery, never from tinting the whole canvas toward cream/sand — that's the single most common 2026 AI-generated-design tell (near-white, low-chroma, hue 40–100 background), and avoiding it is exactly why this revision re-tuned the *accent* colors instead of reaching for the obvious "make it cream" fix.

### Semantic (functional, not brand)
- **Warning Amber** (#F59E0B), **Urgent Red** (#EF4444), **Hostel Purple** (#9333EA): unchanged, functional-only, never substitute for terracotta in a trust/CTA role.

### Named Rules
**The One Accent Rule** (formerly "The One Gold Rule"). Terracotta is the only accent used for primary actions and trust signals, and it stays rare by design — CTAs, the verification stamp, featured markers. The moment it decorates something merely for color's sake (an icon that isn't a primary action, body text, a background wash), it has crossed from "warm accent" into "loud," which is the opposite of the brief.

## 3. Typography

**Display Font:** Outfit (unchanged)
**Body Font:** Outfit (unchanged)
**Label/Mono Font:** JetBrains Mono (unchanged)

**Character:** Unchanged from the prior revision — Outfit carries voice and hierarchy, JetBrains Mono is the "this is verified data" contrast axis for prices, specs, and addresses. The premium pivot is expressed through color, imagery, layout (masonry), and motion (scroll reveals) — not through a font swap. A serif display face was considered and rejected during the `ui-ux-pro-max` pass as the generic "luxury real estate" reflex; Outfit + JetBrains Mono stays because it's already a deliberate, working pairing, and changing it now would be change for its own sake.

### Hierarchy
Unchanged from the prior revision — Display / Headline / Title / Body / Label roles and weights all carry over.

### Named Rules
**The Proof-Is-Mono Rule.** Unchanged: any number a user might use to decide whether to trust or act on a listing renders in JetBrains Mono.

## 4. Elevation

Unchanged in philosophy (soft ambient depth, deepening on interaction). Shadow tint stays on the accent color for components carrying it (card-lift hover) — only the hex changed, from gold to terracotta.

### Shadow Vocabulary
- **Ambient rest** (`box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05)` — Tailwind `shadow-sm`): Unchanged. Default resting state for listing cards and highlight tiles.
- **Ambient hover** (terracotta-tinted, e.g. `shadow-gold-900/5`): Highlight tiles deepen slightly on hover.
- **Lift on interaction** (`box-shadow: 0 20px 40px -8px rgba(180, 82, 47, 0.2)` + `translateY(-4px) scale(1.005)`): Listing cards (`.card-lift`) — terracotta-tinted glow, the strongest elevation response in the system.
- **Floating chrome** (`shadow-xl`, `shadow-2xl`): Search box, hero showcase, mobile drawer, modals. Unchanged.

### Named Rules
**The Earned Depth Rule.** Unchanged: no shadow appears without either genuine ambient rest applied consistently, or a direct interaction response.

## 5. Components

### Buttons
- **Shape:** Full pill (`rounded-full`). Unchanged.
- **Primary:** Solid Terracotta (#B4522F–#C97850 range) background, **white text** (the opposite pairing from the gold revision — terracotta-500 is dark enough that white passes at 5.01:1 directly, no separate dark-text variant needed). `hover:` deepens to terracotta-600. Used for the single primary action per view (Search, Join free, Get started free).
- **Secondary:** Terracotta Pale background with Terracotta Deep text and a gold-200 border — Post/Request, Membership nav pills, Advanced filters.
- **Ghost/Neutral:** White or transparent background, slate-200 border, slate-600/700 text. Unchanged.
- **Hover / Focus:** Simple color deepen on hover, `active:scale-95`. Focus ring now terracotta (`#C97850`) instead of gold — reads clearly against both white and dark-ink sections.

### Chips / Pills (filters, deal-type toggles)
- **Style:** Full-pill, unchanged shape. Active state = solid terracotta with white text; inactive = white with slate-200 border.
- **Category exception:** Hostel toggle stays purple when active — unchanged, keeps category selection visually distinct from deal-type selection.

### Cards / Containers — Masonry Showcase (new)
- **Layout:** Featured listings render in a CSS-columns masonry grid (`columns-1 sm:columns-2 lg:columns-3`, `break-inside-avoid` per card) instead of a uniform row grid. Photo height varies per card (five-step rotation: 160/224/192/256/176px) so the masonry effect is real, not a grid that merely happens to use column layout.
- **Corner Style:** `rounded-2xl` for listing cards; `rounded-[1.75rem]` for the hero showcase card. Unchanged.
- **Background:** White, always. Unchanged.
- **Shadow Strategy:** Ambient rest → gold-tinted lift on hover (see Elevation).
- **Border:** Hairline slate at rest; gold-200 on hover where interactive.

### Inputs / Fields
- **Style:** `rounded-xl`, `bg-slate-50` fill, `border-slate-200` at rest. Unchanged.
- **Focus:** Border shifts to gold-300 (was blue-200/400).

### Navigation
- **Header:** Fixed, `bg-white/95` with backdrop blur. Unchanged structurally; nav pills now use the gold Secondary style, primary "Join free" uses gold Primary.
- **Mobile:** Slide-in drawer, unchanged.

### Scroll Reveals (new)
`useScrollReveal` hook (Intersection Observer, `threshold: 0.15`) wraps the sections that are genuinely below the fold on load — Featured Listings, Community Reviews, the Membership CTA. Content defaults to visible (opacity-100) if `IntersectionObserver` is unavailable; the reveal is progressive enhancement, never a visibility gate, per the animate.md rule that reveals must enhance an already-visible default.

### The Verification Stamp (signature component, unchanged)
Rotated (-3deg) pill, `border: 1.5px solid currentColor`, solid dot, JetBrains Mono uppercase. Rendered in terracotta (`text-gold-700`, same Tailwind key as before — only the hex values under it changed) — the stamp is exactly the kind of rare, meaningful accent terracotta exists for.

### Neighborhood Map
District choropleth (Leaflet + GeoJSON) recolored to a terracotta heat scale (none → pale terracotta → deep terracotta for the highest-density district) against the warm-ink border/active-state accents — "hotter" districts still read as valuable rather than just data-dense.

## 6. Do's and Don'ts

### Do:
- **Do** use Terracotta for every primary action and trust signal — but only those. Restraint is what makes it feel premium rather than loud.
- **Do** pair terracotta backgrounds with white text (5.01:1+ — the opposite pairing from the old gold system, which needed dark text).
- **Do** render prices, specs, and addresses in JetBrains Mono. Unchanged.
- **Do** use the `.stamp` motif (now terracotta) for anything verification-related.
- **Do** vary masonry card photo heights so the showcase reads as curated, not templated.
- **Do** keep scroll reveals progressive-enhancement — content must never depend on JavaScript running to become visible.

### Don't:
- **Don't** use cream/sand/warm near-white backgrounds for the page canvas. This is unchanged and non-negotiable through every revision so far, including this one — this revision got its warmth by re-tuning the ink and accent hues, specifically *so that* the page canvas wouldn't need to become cream. Reaching for a cream canvas now would trade the navy+gold cliché for an even more common one (pale cream + terracotta + serif is the single most recognizable 2026 AI-generated-design pattern).
- **Don't** use gradient text or decorative glassmorphism. Unchanged bans.
- **Don't** let terracotta sprawl past its rare-accent role — an icon that isn't a primary action, body text, or a page-wide terracotta wash all cross from "warm" into "loud."
- **Don't** build a hero around an abstract metric widget. Unchanged ban.
- **Don't** gate content visibility behind a scroll-triggered class. Reveals enhance; they never hide-by-default.
- **Don't** introduce a serif display face by reflex just because the palette is now warm/terracotta — Outfit + JetBrains Mono was a deliberate choice against the generic "warm luxury real estate" default during the `ui-ux-pro-max` pass, and that reasoning still applies unchanged.
