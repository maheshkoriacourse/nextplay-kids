# NextPlay Kids — Design System

Premium youth-sport aesthetic. Deep navy stage, electric accents, confident display type.
Tagline: **"Every child deserves a place to play."**

---

## 1. Color

| Token | Value | Use |
|---|---|---|
| `--ink` | `#060B1C` | Deepest background (hero, footer, dashboards) |
| `--navy` | `#0A1128` | Base page background |
| `--navy-2` | `#0D1633` | Section alternates |
| `--surface` | `#101A3A` | Cards, panels |
| `--surface-2` | `#152142` | Hover / raised surfaces |
| `--line` | `rgba(234,240,255,.10)` | Borders, dividers |
| `--text` | `#EAF0FF` | Primary text (12.8:1 on navy) |
| `--muted` | `#9AA7C7` | Secondary text (5.4:1 on navy — AA) |
| `--green` | `#00E676` | Primary accent: CTAs, success, highlights. Text on green = `#06210F` |
| `--orange` | `#FF6A3D` | Secondary accent: energy, camp/booking badges. Text on orange = `#2A0D05` |
| `--sky` | `#5AB8FF` | Info accents, links |
| `--gold` | `#FFC64D` | Ratings, achievement stars |
| `--danger` | `#FF5C7A` | Errors, destructive |

Rules:
- Green is the **only** primary-action color. Orange never competes on the same button row.
- Never put green text on orange or vice-versa; accents sit on navy surfaces only.
- Gradients: `linear-gradient(135deg, hsl(H 70% 24%), hsl(H+40 80% 12%))` for product tiles, hue per sport.

## 2. Typography

- **Display:** `Sora` 700/800 — hero headlines, section titles, prices. Tight tracking (`letter-spacing:-.03em`).
- **Body/UI:** `Manrope` 400–700 — paragraphs, nav, buttons, forms.
- Scale (fluid, `clamp`):

| Style | Size | Notes |
|---|---|---|
| Hero | `clamp(2.6rem, 6vw, 4.6rem)` | 800, line-height 1.04 |
| H2 section | `clamp(1.8rem, 3.4vw, 2.6rem)` | 800 |
| H3 card | `1.15–1.35rem` | 700 |
| Body | `1rem / 1.65` | 400 |
| Small/meta | `.8–.85rem` | 500, muted |

- NEVER Inter, Roboto, or Space Grotesk.

## 3. Spacing & Radii

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 (`--sp-*`).
- Section vertical rhythm: `--sp-9` (96px) desktop → `--sp-7` (48px) mobile.
- Radii: cards **16px** (`--r-card`), tiles **18px**, buttons **999px** (pill), inputs **12px**, chips **999px**.

## 4. Elevation

| Token | Value | Use |
|---|---|---|
| `--sh-1` | `0 6px 24px rgba(2,6,23,.35)` | Cards at rest |
| `--sh-2` | `0 14px 40px rgba(2,6,23,.5)` | Hover / modals |
| `--sh-green` | `0 10px 30px rgba(0,230,118,.25)` | Primary button glow |

Shadows are always soft, never sharp black.

## 5. Buttons

| Class | Look | Use |
|---|---|---|
| `.btn` (primary) | Green fill, `#06210F` text, pill, `--sh-green` | One per view-group: Add to Cart, Book |
| `.btn-ghost` | 1px `--line` border, transparent, text color | Secondary: Find Their Sport, View all |
| `.btn-orange` | Orange fill | Camps/booking energy moments only |
| `.btn-sm` | `.8rem` padding | Card CTAs, table actions |

- Min touch target 44px. Hover: `translateY(-1px)` + shadow lift. Active: `translateY(0) scale(.98)`.

## 6. Cards

- `.card`: `--surface` bg, 1px `--line` border, `--r-card`, `--sh-1`, padding 24px.
- `.card:hover`: border lightens, `--sh-2`, image tile scales 1.04.
- Product tile: gradient panel (radius 12px, inner) + emoji glyph 56px + name overlay + corner badges.
- Badge chips: safety `🛡 Certified` (green tint), age pill (orange tint), sustainable (green outline).

## 7. Motion

- Scroll-reveal: `.reveal { opacity:0; transform:translateY(24px) }` → `.in` via IntersectionObserver, `transition .7s cubic-bezier(.2,.7,.2,1)`.
- Stagger: `[data-stagger]` children get `transition-delay: calc(i * 70ms)` set in JS.
- Page-load hero: keyframe fade-up staggered 0–.5s.
- Carousel: transform-based track, no layout thrash.
- `prefers-reduced-motion: reduce` → all transitions/animations ~0, reveals visible immediately.
- No parallax, no film grain, no bounce easings. Motion is calm and confident.

## 8. Components

- **Nav:** sticky, `backdrop-filter: blur(14px)`, `rgba(6,11,28,.8)` bg. Cart pill with live count badge. Mobile: hamburger → slide-down panel (820px breakpoint).
- **Forms:** dark inputs `#0B142E`, 12px radius, green focus ring. Labels always visible. Errors in `--danger` with helper text.
- **Tables (dashboards/safety):** sticky header, zebra rows `rgba(255,255,255,.02)`.
- **Toggle:** 44×26 pill switch, green when on.
- **Toast:** bottom-center pill, green border, auto-dismiss 3s.
- **Skeleton:** shimmer `linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)`.
- **Accordion (FAQ):** `<details>`-style buttons with rotating chevron.
- **Charts:** CSS bars — height %, green fill, muted track, value labels.

## 9. Accessibility

- WCAG AA contrast on all text/background pairs (verified tokens above).
- `:focus-visible` → 2px `--green` outline + 2px offset, everywhere.
- Skip-to-content link first in DOM, visible on focus.
- Alt text on every image placeholder (emoji tiles carry `role="img"` + `aria-label`).
- Full keyboard nav: hamburger, quiz options, filters, accordions, carousels (arrow-key support on quiz).
- Landmarks: header/nav/main/footer; single `<h1>` per page.

## 10. Breakpoints

| Width | Behavior |
|---|---|
| ≥1100px | Full desktop, 4-col grids |
| 820–1099px | 2–3-col grids, nav condenses |
| 480–819px | Hamburger nav, 2-col product grid, sidebars stack |
| <480px | 1-col critical flows, 28px section padding |

## 11. Voice & Content

- Parents are account holders; kids are players. Consent language everywhere data appears.
- ₹ INR pricing. Mumbai-local program references. Indian names in samples.
- No body-shaming, no win-pressure. Effort, confidence, joy, safety first.
- Adaptive/inclusive options are first-class, never an afterthought.
- Wellness guidance ≠ medical advice — always labelled.