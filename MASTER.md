---
name: HamroGhar
description: Editorial-premium rental marketplace for Nepal — warm-parchment canvas, espresso ink, terracotta accent, graphite counterpoint, Fraunces editorial serif over Outfit geometric sans.
version: "2026-08-11 — genjutsu:paint pass, supersedes DESIGN.md v3 (2026-07-03)"
colors:
  canvas-parchment: "#F7EFE4"
  canvas-parchment-deep: "#EFE3D2"
  warm-ink: "#2B211A"
  warm-ink-darkest: "#1A1410"
  warm-ink-pale: "#F3EFEB"
  terracotta: "#B4522F"
  terracotta-bright: "#C97850"
  terracotta-deep: "#7D3720"
  terracotta-pale: "#FBF1EC"
  graphite: "#22252A"
  graphite-soft: "#3A3E45"
  slate-gray: "#64748B"
  hairline-slate: "#E2E8F0"
  hairline-parchment: "#DED0B8"
  warning-amber: "#F59E0B"
  urgent-red: "#EF4444"
  hostel-purple: "#9333EA"
typography:
  display:
    fontFamily: "Fraunces, 'Times New Roman', serif"
    fontOpticalSizing: "auto"
    fontWeight: 600
    letterSpacing: "-0.01em"
    lineHeight: 1.08
  headline:
    fontFamily: "Fraunces, 'Times New Roman', serif"
    fontWeight: 500
    letterSpacing: "-0.005em"
    lineHeight: 1.15
  body:
    fontFamily: "Outfit, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontWeight: 700
    letterSpacing: "0.08em"
radii:
  editorial-sm: "2px"
  editorial-md: "4px"
  utility-sm: "8px"
  utility-md: "12px"
  utility-full: "9999px"
spacing:
  unit: "4px"
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
  section-gutter: "clamp(64px, 8vw, 128px)"
motion:
  utility:
    duration: "120-200ms"
    easing: "ease-out"
    hover: "opacity/color only, no transform"
  editorial:
    duration: "400-600ms"
    stagger: "80-120ms"
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    hover: "scale 1.02-1.04 + image reveal, caption fade delayed"
  forbidden: ["bounce", "elastic", "spring-overshoot", "decorative motion on utility screens"]
components:
  button-primary-utility:
    backgroundColor: "{colors.terracotta}"
    textColor: "#FFFFFF"
    rounded: "{radii.utility-full}"
    padding: "10px 20px"
  button-primary-utility-hover:
    backgroundColor: "{colors.terracotta-deep}"
  card-editorial:
    backgroundColor: "{colors.canvas-parchment-deep}"
    rounded: "{radii.editorial-md}"
    border: "1px solid {colors.hairline-parchment}"
  card-utility:
    backgroundColor: "#FFFFFF"
    rounded: "{radii.utility-md}"
    border: "1px solid {colors.hairline-slate}"
---

# Design System: HamroGhar — Editorial Premium

## 1. Overview

**Creative North Star: "Architectural Digest for Verified Rentals"**

This is a deliberate, eyes-open supersession of `DESIGN.md`'s 2026-07-03 "Verified Stamp (warm revision)" — that revision's own text explicitly rejected a serif display face and a warmed page canvas as *"the generic luxury real estate reflex"* and *"trading one AI-cliché for a more common one."* This pass makes that exact trade anyway, on request, having named the risk out loud first (see the brainstorm this document's PR/commit references, or the session transcript that generated it). The justification: the brief specifically wants the editorial/architectural-digest register (Airbnb × Zillow × Kinfolk/Dwell), and that register is not reachable within the prior system's constraints (sans-only, white canvas). Two mitigations keep this from landing as generic-default:

1. **Specific serif, not the obvious one.** Fraunces (Kinfolk/Dwell register), not Playfair Display (the actual most-common AI-default serif).
2. **A cooler counter-note.** A new graphite neutral is introduced specifically so the palette reads "earthy *and* modern," not just "warm" — a pure cream+terracotta+serif system has no cool note anywhere, which is part of what makes that combination read as templated.

**What carries over unchanged from the prior system:**
- Espresso ink (`#2B211A`) as primary text/structural weight
- Terracotta as the one rare accent — CTAs, verification stamp, featured/premium markers, still restrained (The One Accent Rule stands)
- JetBrains Mono for any number a user acts on (price, size, address) — the Proof-Is-Mono Rule stands
- Masonry showcase grids, scroll-triggered reveals (progressive enhancement, never hidden if JS fails)
- Outfit as the UI/body sans — already the geometric sans the brief asked for, not replaced

**What changes:**
- Page canvas: white/near-white → warm parchment `#F7EFE4` (the rule this system most emphatically banned, now deliberately lifted)
- Headlines: Outfit → Fraunces, high-contrast editorial serif
- A new graphite neutral (`#22252A`) for dark UI chrome — the "modern deep neutral" counterpoint
- Shape language splits: sharp/architectural (0–4px radius) on editorial surfaces, pill-rounded retained on utility controls — previously uniform pill-rounded everywhere
- Motion splits: fast/dry utility vs. slow/deliberate editorial — previously uniform fast timing everywhere

## 2. Colors

### Canvas
- **Parchment** (`#F7EFE4`): New page-canvas default, replacing white/near-white everywhere except utility surfaces (see below).
- **Parchment Deep** (`#EFE3D2`): Card/section backgrounds that need to sit one step down from canvas — editorial card fill.
- **Utility exception**: search, filters, forms, dashboard, chat keep a near-white ground (`#FFFFFF` / `bg-slate-50`) — warmth is an editorial-surface trait here, not a whole-app trait, so the "app" parts stay legible and fast to scan.

### Ink
- **Warm Ink** (`#2B211A`) / **Darkest** (`#1A1410`) / **Pale** (`#F3EFEB`): unchanged from prior system.

### Accent
- **Terracotta** (`#B4522F` / bright `#C97850` / deep `#7D3720` / pale `#FBF1EC`): unchanged. Still the one rare accent — if it starts decorating things that aren't a primary action or trust signal, it has crossed into "loud."

### New: Graphite (modern deep neutral)
- **Graphite** (`#22252A`) / **Graphite Soft** (`#3A3E45`): Used for dark UI chrome — nav bar, dashboard shell, owner-side tooling. This is the palette's cool note: where the prior system's dark surfaces were warm-ink-darkest everywhere, graphite gives dense utility surfaces (dashboard, chat) a "modern platform" register distinct from the editorial warm-ink used in hero/showcase dark sections. Editorial dark surfaces (hero gradient, featured showcase) keep warm-ink-darkest; utility dark surfaces (dashboard chrome) use graphite.

### Neutral / Semantic
Unchanged: Slate Gray `#64748B`, Hairline Slate `#E2E8F0` (utility borders), new Hairline Parchment `#DED0B8` (editorial-surface borders, warmer than slate hairline to sit correctly on parchment), Warning Amber, Urgent Red, Hostel Purple — functional only.

## 3. Typography

**Display/Headline:** Fraunces — variable font, optical sizing on (`font-optical-sizing: auto`), weight 500–600, tight tracking. Reserved for H1/H2 editorial headlines: hero headline, listing title on detail page, section headers on homepage/showcase. Not used for UI labels, buttons, or body copy.

**Body/UI:** Outfit — unchanged, carries all UI chrome, body copy, buttons, form labels, nav.

**Data/Proof:** JetBrains Mono — unchanged, carries price, size (sqft/sqm), address, verification codes.

**Loading:** current `public/index.html` links Inter, not Outfit — a pre-existing drift from `DESIGN.md`'s own spec, unrelated to this repaint. Phase 4 will add the Fraunces + Outfit Google Fonts link and drop the stale Inter link.

**Scale (fluid, `clamp()`):**
| Role | Size | Font |
|---|---|---|
| Display (hero H1) | `clamp(2.5rem, 5vw, 4.5rem)` | Fraunces 600 |
| Headline (H2, listing title) | `clamp(1.75rem, 3vw, 2.75rem)` | Fraunces 500 |
| Title (H3, card title) | `1.25rem` | Outfit 700 |
| Body | `1rem` | Outfit 400 |
| Label/mono | `0.8125rem` | JetBrains Mono 700, tracked |

## 4. Spacing

Base unit `4px`. Scale: 4/8/12/16/24/32/48/64/96/128. Section gutters move from the prior system's tighter rhythm to `clamp(64px, 8vw, 128px)` between major editorial sections — this is the concrete expression of "airy, magazine-grid" from the brainstorm. Utility surfaces (forms, dashboard) keep the tighter existing rhythm; this looser gutter is editorial-surface only.

## 5. Radii — split by surface

| Surface | Radius | Rationale |
|---|---|---|
| Editorial (cards, showcase tiles, hero elements) | `2px`–`4px` | Sharp/architectural — the "building elevation" read from the brainstorm |
| Utility (buttons, search bar, filter chips, form inputs) | `12px`–`9999px` (pill retained) | Keeps the "approachable app" feel where users are transacting, not browsing |

## 6. Shadows

Unchanged philosophy from prior system: soft ambient rest, deepens on interaction, shadow tint stays on the accent color for terracotta-carrying components. Editorial cards on the parchment canvas use a warmer, lower-opacity shadow (`rgba(43, 33, 26, 0.08)`) than utility cards on white (`rgba(15, 23, 42, 0.05)`), since a cool-tinted shadow reads wrong sitting on a warm surface.

## 7. Motion Tokens

See `motion:` block in frontmatter. Two named regimes:
- **Utility** — 120–200ms, ease-out, opacity/color hover only. Search, filters, forms, dashboard, chat, nav.
- **Editorial** — 400–600ms reveals with 80–120ms stagger, `cubic-bezier(0.16, 1, 0.3, 1)`, scale+reveal hover. Homepage hero, listing detail imagery, featured/masonry showcase.
- **Forbidden everywhere**: bounce, elastic, spring-overshoot; decorative motion on utility screens; anything that ignores `prefers-reduced-motion`.

## 8. Base Components — 5-state rule

Every interactive element needs default / hover / focus / active / disabled, per surface's motion regime. Utility buttons: color/opacity transitions only. Editorial interactive elements (showcase tiles, listing cards in masonry): scale + reveal per the editorial hover spec.

---

## Migration note

This file supersedes `DESIGN.md` as the canonical design source. `DESIGN.md` is kept for history (it documents *why* the prior warm-but-sans-and-white system existed, which is useful context if a future pass wants to revert toward it). `PRODUCT.md`'s brand-personality and anti-references sections are unaffected — this is a visual-layer repaint, not a positioning change; "premium/architectural/aspirational" as a *positioning* was already the target, this pass just picks a different visual vocabulary to express it.
