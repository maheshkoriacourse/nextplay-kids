# NextPlay Kids — Cinematic Kids' Sports Ecommerce Prototype

**Live:** https://maheshkoriacourse.github.io/nextplay-kids/
*"Every child deserves a place to play."*

A complete multi-page ecommerce prototype for a children's sports company — pure HTML/CSS/JS, no build tools, no external dependencies except Google Fonts (Sora + Manrope).

## Pages (16)

| Page | What's inside |
|---|---|
| `index.html` | Cinematic hero, age groups, 19-sport grid, best-seller carousel, mini-quiz, safety promise, programs, testimonials, schools banner, newsletter |
| `shop.html` | 45 products, 10 filters, sorting, search, skeletons, empty state, active-filter chips |
| `product.html` | `?id=` template — gallery, size/colour pickers, safety box, reviews, related |
| `explorer.html` | 6-question quiz → 3 sport matches with reasons, program + starter bundle |
| `ages.html` | 5 age groups with gear, safety notes, programs per stage |
| `programs.html` | 12 Mumbai programs with pricing, ratios, venues |
| `camps.html` | 8 camps/events incl. birthday parties & adaptive fun day |
| `schools.html` | Bulk bundles, roster tools, partnership inquiry form |
| `dashboard-parent.html` | Child profiles, progress charts, consent toggles, reorder, coach messages |
| `dashboard-coach.html` | Roster, attendance, scheduler, approved messaging, inventory, plan builder |
| `safety.html` | Helmet fit, cm size charts (footwear/pads/cricket), returns, wellness≠medical |
| `about.html` | Story, six values, adaptive sport commitment |
| `contact.html` | Validated form, WhatsApp/phone/email, venues, 8-item FAQ accordion |
| `cart.html` | localStorage cart, qty edit, delivery validation, demo checkout, success state |
| `privacy.html` | DPDP-aligned parental-consent policy |
| `child-safety.html` | Safeguarding standards + reporting channel |

Plus `DESIGN-SYSTEM.md` (full token/component/motion spec).

## Architecture

- `styles.css` — CSS-variable design system (navy #0A1128 / green #00E676 / orange #FF6A3D), 3 breakpoints (480/820/1100), reduced-motion support
- `app.js` — injected header/footer, cart store, reveal-on-scroll, accordions, toasts
- `data.js` — 45-product catalogue, 19 sports, 5 age bands, 12 programs, 8 camps
- `shop.js` — shared card renderer, shop filters/sort/search, product page engine
- `home.js` `explorer.js` `cart.js` `contact.js` `schools.js` `dash.js` — page behaviours

Everything is sample data; cart + quiz state persist in localStorage only. Demo store — no real payments.