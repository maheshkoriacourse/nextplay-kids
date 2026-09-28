# DESIGN-UPGRADE.md — NextPlay Kids "THE FIRST ARENA" cinematic layer

Scope: **additive layer** loaded ONLY on `index.html`, `shop.html`, `product.html`
(after `styles.css`). `styles.css`, `data.js`, `cart.js` stay byte-identical;
`app.js` gets one bug-fix (footer shop links now use the `?sport=` contract
shop.js actually reads). All 16 pages keep working; the other 13 pages never
load the layer, so they cannot regress.

---

## 1. Concept

Childhood as a hero's **first arena**: floodlit night-match energy (Nike-ad
drama) with Pixar warmth (soft light, rounded cards, playful micro-motion).
Sports-documentary grammar: chapter numbering, broadcast lower-thirds,
Ken Burns photography, floodlight sweeps — never candy-SaaS, never clipart.

## 2. Color — new tokens (layer-scoped)

| Token | Dark (default) | Light (`data-theme="light"`) | Use |
|---|---|---|---|
| `--arena-ink` | `#050914` | `#F2F5FB` | hero/footer stage |
| `--flood-gold` | `rgba(255,198,77,.17)` | `rgba(255,176,32,.20)` | floodlight wash A |
| `--flood-green` | `rgba(0,230,118,.11)` | `rgba(0,168,90,.12)` | floodlight wash B |
| `--gold-hi` | `#FFE9B0` | `#B97708` | gradient-text highlight |
| `--gold-deep` | `#FF9E3D` | `#C2410C` | gradient-text low |
| `--line` override | unchanged | `rgba(11,17,38,.10)` | borders flip alpha |
| `--text/--muted/--surface/--input` | unchanged | dark-on-light set | full surface flip |

Brand DNA kept: navy base + green primary + orange energy. Gold is
**lighting, not a fourth action color** — it appears only as light, text
sheen, confetti and the scroll-progress line.

## 3. Typography

- Keep Sora 700/800 + Manrope (per DESIGN-SYSTEM "NEVER Inter/Roboto/Space Grotesk").
- New: `.kinetic` display treatment — two masked rise lines, tight tracking,
  gold floodlight gradient on the tagline words + slow sheen sweep.
- Eyebrows become **chapter numbers**: `01 · Ages & Stages` (documentary cut).

## 4. Motion system (vanilla JS, `cinema.js`, ~9KB)

| Pattern | Where | Spec |
|---|---|---|
| Boot sequence | index | CSS-only: floodlight wordmark flicker → auto-fade by **0.9s**; JS may dismiss early (~0.45s after DOM ready). No-JS safe (pure CSS timer). |
| Hero entrance | index | masked line-rise + CTA/stats fade-up, delays .9s–1.4s, `--ease-out` |
| Ken Burns | hero photo, safety photo | scale 1→1.08, 18s ease-in-out alternate |
| Floodlight sway | hero | 3 blurred beams, translate/rotate ±2°, 12–16s alternate, GPU transforms only |
| Scroll scrub | hero copy + beams | rAF, translateY ≤48px + fade, desktop fine-pointer only |
| Reveal v2 | all sections | existing `.reveal/.in` contract kept; `refreshReveal` patched to IO + sibling stagger 60ms (cap 420ms) — this re-staggers shop grid on every filter re-render |
| Count-up | hero stats | IO once, 900ms easeOut, `en-IN` grouping, finals already in HTML (no-JS safe) |
| Marquee | index band | duplicated track, 28s linear, pause on hover |
| Card hover depth | shop/product cards | translateY(-6px) + green-tinted shadow + glyph pop |
| Gallery zoom | product | pointer pan-zoom (scale 1.9, origin follows cursor), dblclick/tap toggle, Esc closes, accessible zoom button |
| Sticky buy bar | product <1101px | appears after hero, mirrors `#pd-add` |
| Confetti hover | schools band | CSS-only pseudo-element burst |
| Theme toggle | all 3 pages | 🌙/☀️ pill in nav, `data-theme` on `<html>`, `localStorage np_theme` |

Easing tokens: `--ease-out: cubic-bezier(.16,1,.3,1)`, `--ease-soft: cubic-bezier(.33,1,.68,1)`.
Durations: 200/350/600/900/1200ms. **No janky parallax stacks, no bounce.**

## 5. Materials & lighting

- Stadium grain: inline SVG `feTurbulence` data-URI (~250B), 5% opacity.
- Dust motes: 5 blurred radial-gradient dots, 14–22s drift.
- Lower-third tags: reuse existing photo-tag pill language.
- Victory confetti: 8 CSS pseudo-element shards, gold/green/orange.

## 6. Performance ledger (added weight per flagship page)

- `cinema.css` ≈ 15KB + `cinema.js` ≈ 9.5KB + inline theme snippet ≈ 0.2KB
- **< 25KB JS+CSS added per page; no new libs; no new binary assets** (existing
  `/img/*.webp` reused with `loading=lazy/decoding=async` below the fold).
- All animation = `transform`/`opacity` (compositor-only); single rAF loop for
  scroll-scrub + progress bar; IO for everything else.

## 7. Accessibility & fallback

- `prefers-reduced-motion: reduce` → boot skipped, Ken Burns/floodlights/scrub/
  marquee/count-up/zoom-anim all off; content 100% visible (reveal no-ops).
- Loader is CSS-animation-driven → disappears even with JS disabled.
- Semantic landmarks kept; single `<h1>` per page; all added controls are real
  `<button>/<a>` with labels; focus-visible ring inherited (gold on hero).
- Contrast: gold gradient text ≥ 8:1 on midnight; light-mode token set ≥ AA.
- Keyboard: zoom button focusable + Esc; marquee `aria-hidden` (duplicated
  content); progress bar `aria-hidden`; toggle has `aria-pressed`.

## 8. Contracts preserved (checklist)

- `data.js` untouched; `NP.cart` / `np_cart` localStorage shape untouched.
- `app.js` DOM ids (`#site-header`, `#site-footer`, `.back-top`, `.toast`,
  `.cart-count`) untouched; reveal system untouched (patch is additive).
- shop.js engine untouched: 45 products, 10 filters, sort, search, chips,
  skeletons, empty state, `window.ShopReset`, `?sport/?cat/?age/?q` params.
- product page `?id=` contract untouched; all `#pd-*` ids intact.
- home.js hooks intact: `#bs-track` ± `.car-btn`, quiz ids, newsletter ids.
- All cross-page links (nav, footer, cards, program `contact.html?book=`) kept.
- index `#prog-grid` now actually rendered (was an empty dead section).

## 9. Known limits / next polish

- Product gallery stays gradient+emoji tiles (data has no per-product photos);
  next pass: map a shared photo pool by sport hue for photographic galleries.
- Light theme ships on the 3 flagship pages only (by design, layer is scoped).
- No video: hero motion is CSS-only by page-weight mandate.