#!/usr/bin/env python3
"""NextPlay Kids investor deck — bespoke builder with full layout control.

Dark navy brand theme, precise positioning, brand fonts, KPI cards,
accent bars, two-tone stat blocks. No reliance on template placeholders
(placeholder defaults are what made the first deck look broken).
"""
import json
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION

# ---- brand palette ----
NAVY   = RGBColor(0x0A, 0x11, 0x28)
NAVY2  = RGBColor(0x10, 0x1B, 0x33)
PANEL  = RGBColor(0x14, 0x21, 0x3A)
GREEN  = RGBColor(0x00, 0xE6, 0x76)
ORANGE = RGBColor(0xFF, 0x6A, 0x3D)
GOLD   = RGBColor(0xE8, 0xB4, 0x5A)
WHITE  = RGBColor(0xF2, 0xF4, 0xF8)
GREY   = RGBColor(0x9A, 0xA3, 0xB5)
DIM    = RGBColor(0x6B, 0x76, 0x8C)
LINE   = RGBColor(0x27, 0x33, 0x4D)
RED    = RGBColor(0xFF, 0x5C, 0x5C)

FONT_D = "Segoe UI"      # display
FONT_B = "Segoe UI"      # body (universally available, clean)

EMU_W = 12192000  # 13.333 in
EMU_H = 6858000   # 7.5 in

prs = Presentation()
prs.slide_width = Emu(EMU_W)
prs.slide_height = Emu(EMU_H)
SW, SH = 13.333, 7.5


def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def box(slide, l, t, w, h, fill=None, line_color=None, radius=True):
    from pptx.enum.shapes import MSO_SHAPE
    shp = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(l), Inches(t), Inches(w), Inches(h))
    try:
        shp.adjustments[0] = 0.07
    except (IndexError, ValueError):
        pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line_color is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line_color; shp.line.width = Pt(1)
    shp.shadow.inherit = False
    return shp


def text(slide, l, t, w, h, runs, size=16, color=WHITE, bold=False,
         align="l", anchor="t", spacing=1.0, space_after=6, font=FONT_B):
    """runs: str or list of (text, dict-overrides) tuples; newline = new para."""
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = 0; tf.margin_right = 0; tf.margin_top = 0; tf.margin_bottom = 0
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anchor]
    if isinstance(runs, str):
        runs = [[(runs, {})]]
    elif runs and isinstance(runs[0], tuple):
        runs = [runs]
    first = True
    for para in runs:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = ALIGNS[align]
        p.line_spacing = spacing
        p.space_after = Pt(space_after)
        for txt, ov in para:
            r = p.add_run(); r.text = txt
            f = r.font
            f.name = ov.get("font", font)
            f.size = Pt(ov.get("size", size))
            f.bold = ov.get("bold", bold)
            f.italic = ov.get("italic", False)
            f.color.rgb = ov.get("color", color)
    return tb


from pptx.enum.text import PP_ALIGN
from pptx.enum.text import PP_ALIGN as _PPA
A = "l"
FONT_D = FONT_B = "Segoe UI"
ALIGNS = {"l": _PPA.LEFT, "c": _PPA.CENTER, "r": _PPA.RIGHT}


def header(slide, eyebrow, title, num):
    text(slide, 0.7, 0.42, 10.5, 0.32, eyebrow.upper(), size=12, color=GREEN, bold=True)
    text(slide, 0.7, 0.72, 11.2, 0.9, title, size=32, color=WHITE, bold=True)
    # accent rule
    rule = box(slide, 0.72, 1.62, 0.9, 0.045, fill=ORANGE, radius=False)
    # page number
    text(slide, 12.35, 7.02, 0.6, 0.3, f"{num:02d}", size=10, color=DIM, align="r")
    text(slide, 0.7, 7.02, 5, 0.3, "NextPlay Kids · Investor Brief · Sep 2026", size=9, color=DIM)


def card(slide, l, t, w, h, head, body, head_color=WHITE, body_size=13):
    c = box(slide, l, t, w, h, fill=NAVY2, line_color=LINE)
    text(slide, l + 0.25, t + 0.22, w - 0.5, 0.4, head, size=14.5, color=head_color, bold=True)
    text(slide, l + 0.25, t + 0.72, w - 0.5, h - 0.9, body, size=body_size, color=GREY, spacing=1.12)
    return c


def kpi(slide, l, t, w, value, label, vcolor=GREEN):
    box(slide, l, t, w, 1.28, fill=NAVY2, line_color=LINE)
    text(slide, l, t + 0.14, w, 0.62, value, size=27, color=vcolor, bold=True, align="c")
    text(slide, l, t + 0.82, w, 0.36, label, size=10.5, color=DIM, align="c")


def bullets(slide, l, t, w, items, size=14.5, gap=8):
    """items: list of (kind, text) where kind in {'h','p','s'} head/plain/sub"""
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(4.8))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = 0; tf.margin_top = 0
    first = True
    for kind, txt in items:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        r = p.add_run(); r.text = ("▸ " if kind == "h" else "") + txt
        f = r.font; f.name = FONT_B
        if kind == "h":
            f.size = Pt(size + 1.5); f.bold = True; f.color.rgb = WHITE
            p.space_before = Pt(6); p.space_after = Pt(2)
        else:
            f.size = Pt(size - 1.5); f.bold = False; f.color.rgb = GREY
            p.space_after = Pt(gap)
    return tb


# ================= SLIDE 1 — TITLE =================
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, NAVY)
# right-half full-bleed action photo: kids playing football, sweat, golden hour
pic = s.shapes.add_picture("/home/maheshkoria/nextplay-kids/img/hero-football-ppt.jpg",
                           Inches(7.35), Inches(0.0), Inches(5.983), Inches(4.9))
text(s, 0.7, 0.85, 6, 0.4, "NEXTPLAY KIDS  ·  INVESTOR BRIEF  ·  SEPT 2026", size=12.5, color=GREEN, bold=True)
text(s, 0.65, 1.55, 6.5, 2.4, [[("Every child deserves", {"color": WHITE})],
                               [("a place to play.", {"color": GREEN})]], size=40, bold=True, spacing=1.05)
text(s, 0.7, 3.62, 6.3, 1.2,
     "Youth sports commerce, programs and safety — for India's 350 million children, ages 2 to 17.",
     size=15.5, color=GREY, spacing=1.25)
# KPI row
kpis = [("350M+", "children in India"), ("₹4B+", "sports goods market"),
        ("19", "sports on platform"), ("Live", "prototype shipped")]
for i, (v, l) in enumerate(kpis):
    kpi(s, 0.7 + i * 3.05, 5.05, 2.8, v, l, GREEN if i < 2 else ORANGE)
text(s, 0.7, 6.9, 11, 0.4, "Mahesh Koria · Founder — 19+ years banking & data leadership",
     size=11.5, color=DIM)
notes = s.notes_slide.notes_text_frame
notes.text = ("Frame: we are building the trust layer of Indian youth sport. "
              "One-liner: safer, more accessible, development-focused sport for ages 2-17.")

# ================= SLIDE 2 — PROBLEM =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "THE PROBLEM", "Parents have no trusted partner in youth sport", 2)
cards = [
    ("No trust in what they buy", "Adult gear sold smaller, no honest age ranges, wrong sizes the norm. A helmet that doesn't fit is not gear — it's risk."),
    ("70% quit sport by age 13", "Pressure culture, boring first experiences and badly-fitted kit push children out in their best years."),
    ("No child-development layer", "Retailers shrink adult products. Nobody owns: right gear, right age, right challenge."),
    ("Schools & academies run manual", "Rosters, attendance, parent messaging and equipment live in paper registers and WhatsApp chaos."),
]
for i, (h, b) in enumerate(cards):
    l = 0.7 + (i % 2) * 6.05; t = 2.05 + (i // 2) * 2.28
    card(s, l, t, 5.85, 2.05, h, b, head_color=ORANGE if i == 1 else WHITE)
text(s, 0.7, 6.72, 12, 0.4, "The gap is trust — and trust is exactly what we engineered for.",
     size=13, color=GREEN, bold=True)

# ================= SLIDE 3 — MARKET =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "THE MARKET", "Large, fragmented, and under-served", 3)
kpi(s, 0.7, 2.0, 3.0, "$4B+", "sports goods market", GREEN)
kpi(s, 3.9, 2.0, 3.0, "350M+", "children (2–17)", ORANGE)
kpi(s, 7.1, 2.0, 2.75, "2×", "govt. push (Khelo India)", GREEN)
kpi(s, 10.05, 2.0, 2.55, "35M+", "urban school kids", ORANGE)
bullets(s, 0.7, 3.75, 6.0, [
    ("h", "Five revenue engines, one brand"),
    ("p", "Gear retail (AOV ₹1.8k–4.5k) · Programs & camps (₹4k–25k/term)"),
    ("p", "School & academy B2B bundles · SaaS dashboards · Events"),
    ("h", "Global reference"),
    ("p", "Decathlon & Dick's sell youth SKUs — nobody owns the full child-development stack in India."),
], size=15)
card(s, 7.1, 3.75, 5.5, 2.6, "Why now",
     "· Middle-class spend on child development rising double-digit\n"
     "· NEP mandates physical education — schools must buy, safely\n"
     "· UPI + D2C rails make trust-commerce viable in tier-1/2 cities",
     head_color=GOLD if (GOLD := RGBColor(0xE8, 0xB4, 0x5A)) else WHITE)

# ================= SLIDE 4 — PRODUCT =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "THE PRODUCT", "Trust by design — not a tagline", 4)
prod = [
    ("Safety-first commerce", "Honest age range + safety certification badge on 100% of catalogue. Size-true charts, fit guides with paediatric physios, free exchanges."),
    ("Sports Explorer engine", "Interactive quiz (age, interests, budget, accessibility) → matched sport + starter bundle. Acquisition engine disguised as a service."),
    ("Parent & Coach dashboards", "Progress tracking behind parental-consent controls. Parents are account holders — child data is ours to protect, not to exploit."),
    ("Live prototype — shipped", "16 pages, 45 products, working cart & quiz. Live now: maheshkoriacourse.github.io/nextplay-kids — proof, not promises."),
]
for i, (h, b) in enumerate(prod):
    card(s, 0.7 + (i % 2) * 6.05, 2.05 + (i // 2) * 2.28, 5.85, 2.05, h, b,
         head_color=GREEN if i == 3 else WHITE)
text(s, 0.7, 6.72, 12, 0.4, "Demo available live during Q&A — real filters, real cart, real dashboards.",
     size=13, color=ORANGE, bold=True)

# ================= SLIDE 5 — WHY WE WIN =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "WHY WE WIN", "Four compounding advantages", 5)
wins = [
    ("01", "Trust layer", "Safety certification + fit-first commerce. Parents never leave a brand that prevented a mistake.", GREEN),
    ("02", "The age ladder", "A child entering at 4 grows with us to 17 — 13 years of gear, programs, camps. Retail's highest-LTV story.", ORANGE),
    ("03", "Inclusive by design", "Adaptive sport woven through every category. Real segment, near-zero competition.", GREEN),
    ("04", "Founder-market fit", "19+ years BFSI ops & data leadership + AI architecture — banker's discipline, builder's speed.", ORANGE),
]
for i, (n, h, b, ac) in enumerate(wins):
    l = 0.7 + (i % 2) * 6.05; t = 2.05 + (i // 2) * 2.28
    box(s, l, t, 5.85, 2.05, fill=NAVY2, line_color=LINE)
    text(s, l + 0.25, t + 0.22, 1.0, 0.7, n, size=30, color=ac, bold=True)
    text(s, l + 1.25, t + 0.26, 4.4, 0.4, h, size=15.5, color=WHITE, bold=True)
    text(s, l + 1.25, t + 0.78, 4.4, 1.15, b, size=12.5, color=GREY, spacing=1.1)

# ================= SLIDE 6 — MODEL =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "BUSINESS MODEL", "Gear acquires. Programs retain. SaaS compounds.", 6)
rows = [
    ("Gear e-commerce", "30–45% margin", "Acquisition engine"),
    ("Programs & camps", "₹4k–25k / term", "Retention engine"),
    ("School & academy B2B", "₹50k–5L / contract", "Anchor revenue"),
    ("Coach SaaS", "₹500–2k / seat / mo", "Margin engine"),
]
text(s, 0.7, 2.0, 4, 0.35, "STREAM", size=11, color=DIM, bold=True)
text(s, 5.15, 2.0, 3, 0.35, "ECONOMICS", size=11, color=DIM, bold=True)
text(s, 8.6, 2.0, 3, 0.35, "ROLE", size=11, color=DIM, bold=True)
for i, (a, b, c) in enumerate(rows):
    t = 2.42 + i * 0.62
    box(s, 0.7, t, 11.9, 0.54, fill=NAVY2 if i % 2 == 0 else NAVY, line_color=None)
    text(s, 0.9, t + 0.12, 4.1, 0.35, a, size=13.5, color=WHITE, bold=True)
    text(s, 5.15, t + 0.12, 3.2, 0.35, b, size=13.5, color=GREEN)
    text(s, 8.6, t + 0.12, 3.8, 0.35, c, size=13.5, color=GREY)
card(s, 0.7, 5.35, 11.9, 1.35, "The LTV argument",
     "A child acquired at 7 through a ₹2,500 starter kit generates an estimated ₹1.5–3 lakh lifetime value by 17 — gear as they grow, programs every term, camps every summer. One acquisition, a decade of revenue.")

# ================= SLIDE 7 — TRAJECTORY CHART =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "TRAJECTORY", "5-year revenue path (indicative plan)", 7)
chart_data = CategoryChartData()
chart_data.categories = ["Yr 1", "Yr 2", "Yr 3", "Yr 4", "Yr 5"]
chart_data.add_series("Revenue (₹ Cr)", (1.2, 6.0, 18.0, 42.0, 85.0))
gf = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED,
                        Inches(0.7), Inches(2.0), Inches(7.6), Inches(4.6), chart_data)
ch = gf.chart
ch.has_legend = False
plot = ch.plots[0]; plotV = plot.series[0]
plotV = plot.series[0]
plotV.format.fill.solid(); plotV.format.fill.fore_color.rgb = GREEN
ch.font.size = Pt(12); ch.font.color.rgb = GREY
mile = [("Yr 1", "Mumbai beachhead\n5k orders · ₹1.2 Cr"),
        ("Yr 2", "5 cities · 100 schools\n₹6 Cr"),
        ("Yr 3", "3 cities deep\n₹18 Cr · SaaS live"),
        ("Yr 4–5", "National expansion\n₹42 → 85 Cr")]
for i, (yr, d) in enumerate(mile):
    t = 2.0 + i * 1.18
    text(s, 8.75, t, 3.9, 0.35, yr, size=13, color=GREEN, bold=True)
    text(s, 8.75, t + 0.36, 3.9, 0.75, d, size=11.5, color=GREY, spacing=1.05)
text(s, 0.7, 6.7, 12, 0.35, "Working plan, not a promise — every assumption is open for diligence.",
     size=11, color=DIM)

# ================= SLIDE 8 — GTM =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "GO-TO-MARKET", "Growth loops, not paid-media dependence", 8)
gtm = [
    ("Phase 1 · Mumbai beachhead", "D2C launch + 3 academy partnerships + 2 school contracts. Target: ₹1.2 Cr GMV, 5,000 families in 12 months.", GREEN),
    ("The loop", "Explorer quiz (SEO magnet) → starter bundle → programs → parent communities → school referrals back to retail.", ORANGE),
    ("Content flywheel", "In-house AI film pipeline: studio-grade safety guides, drills and stories at near-zero content cost. Marketing advantage competitors can't match.", GREEN),
    ("B2B wedge", "Schools buy bundles for safety documentation & compliance; we train their coaches and own the relationship.", ORANGE),
]
for i, (h, b, ac) in enumerate(gtm):
    l = 0.7 + (i % 2) * 6.05; t = 2.05 + (i // 2) * 2.28
    box(s, l, t, 5.85, 2.05, fill=NAVY2, line_color=LINE)
    text(s, l + 0.25, t + 0.24, 5.35, 0.4, h, size=15.5, color=ac, bold=True)
    text(s, l + 0.25, t + 0.8, 5.35, 1.1, b, size=12.5, color=GREY, spacing=1.12)

# ================= SLIDE 9 — TECH MOAT =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "TECHNOLOGY & DATA MOAT", "Every sale teaches the system", 9)
moat = [
    ("Fit-data compounding", "Every exchange tells us a child grew 4cm. In 3 years: India's best youth-sizing dataset."),
    ("Consent-based retention", "Progress records families return for. Data stays behind parental consent — by architecture."),
    ("Coach SaaS lock-in", "Academies run rosters, attendance and inventory on our stack — switching is costly."),
    ("AI content at software cost", "Canon-controlled studio pipeline ships broadcast-quality video weekly. Others pay agencies."),
]
for i, (h, b) in enumerate(moat):
    l = 0.7 + (i % 2) * 6.05; t = 2.05 + (i // 2) * 2.28
    card(s, l, t, 5.85, 2.05, h, b, head_color=GREEN if i % 2 == 0 else ORANGE)

# ================= SLIDE 10 — ASK =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
header(s, "THE ASK", "₹3.5 Cr seed — 18-month runway", 10)
kpi(s, 0.7, 2.0, 2.85, "₹3.5 Cr", "seed round", GREEN)
kpi(s, 3.75, 2.0, 2.9, "40%", "inventory & infra", ORANGE)
kpi(s, 6.85, 2.0, 2.9, "25%", "technology", GREEN)
kpi(s, 9.95, 2.0, 2.65, "35%+", "repeat target", ORANGE)
bullets(s, 0.7, 3.7, 6.0, [
    ("h", "18-month milestones"),
    ("p", "₹1.2 Cr GMV · 5,000 families · 3 academies + 2 schools signed"),
    ("p", "Repeat-purchase 35%+ · SaaS pilot with 10 academies"),
    ("h", "Structure"),
    ("p", "SAFE / CCPS · founder-led · governance-ready reporting from day one"),
], size=15)
card(s, 7.1, 3.7, 5.5, 2.6, "What you get",
     "Early entry into the trust layer of a ₹40,000 Cr+ market — with a founder who has managed 9-figure P&Ls, security-audits his own stack, and ships working product in weeks.\n\nDiligence pack ready: live prototype, unit-economics model, safety policy, backup & audit trails.",
     head_color=GOLD)

# ================= SLIDE 11 — CLOSE =================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s, NAVY)
# dojo sparring photo band across the bottom
s.shapes.add_picture("/home/maheshkoria/nextplay-kids/img/dojo-close.jpg",
                     Inches(0.0), Inches(4.42), Inches(13.333), Inches(3.08))
# gradient-style scrim over photo top edge for text legibility
box(s, 0.0, 4.42, 13.333, 0.5, fill=NAVY, radius=False)
text(s, 0.9, 1.4, 11.5, 1.9, [[("Every child deserves", {"color": WHITE}),],
                              [("a place to play.", {"color": GREEN})]], size=44, bold=True, spacing=1.04)
text(s, 0.9, 3.35, 11, 1.0,
     [[("Mahesh Koria", {"color": WHITE, "bold": True, "size": 16})],
      [("Founder · NextPlay Kids — 19+ years banking & data leadership, AI architecture", {"color": GREY, "size": 13})],
      [("Let's build India's most trusted youth-sport company — together.", {"color": ORANGE, "size": 14, "bold": True})]],
     spacing=1.25, space_after=4)
text(s, 0.9, 7.05, 11, 0.35, "NextPlay Kids · Investor Brief · September 2026 · Mumbai",
     size=10, color=DIM)

OUT = "/home/maheshkoria/nextplay-kids/NextPlay-Kids-Investor-Pitch.pptx"
prs.save(OUT)
print("saved", OUT, "slides:", len(prs.slides.__iter__.__self__._sldIdLst))