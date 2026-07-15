---
name: caboodle design
description: The field journal of a learning designer who studies how humans actually change.
colors:
  signal-lime: "#96E650"
  field-blue: "#03599B"
  field-blue-deep: "#024378"
  editorial-magenta: "#EC008C"
  magenta-ink: "#BC006B"
  magenta-lift: "#F24DAF"
  blue-lift: "#6FA3CC"
  graphite-ink: "#282828"
  ash-gray: "#5c5c5c"
  hairline: "#d6d3cc"
  warm-ash-paper: "#f2efe8"
  paper-shadow: "#e8e3d8"
  night-ground: "#141414"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Bauhaus Bool, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(3.5rem, 13vw, 11rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bauhaus Bool, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(1.9rem, 3.8vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bauhaus Bool, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.65rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  card: "10px"
  pill: "999px"
  dogear: "10px 10px 3px 10px"
spacing:
  pad-x: "clamp(1.25rem, 5vw, 5rem)"
  maxw: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.warm-ash-paper}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.4rem"
  input:
    backgroundColor: "{colors.warm-ash-paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "0px"
    padding: "0.75rem 0.9rem"
  input-focus:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite-ink}"
    rounded: "0px"
    padding: "0.75rem 0.9rem"
---

# Design System: caboodle design

## 1. Overview

**Creative North Star: "The Field Journal"**

This is the field journal of a learning designer who studies how humans actually change before she designs anything. The page is warm paper, not a screen: an off-white ground (#f2efe8) carrying a faint multiply grain, the way a notebook page carries tooth. On top of it, two voices work in tension. Bauhaus Bool sets the display, lowercase and enormous, the confident hand-lettered headline of someone who has an opinion. JetBrains Mono sets the chrome: field-note stamps, call numbers, specimen labels, timestamps. The mono is the anthropologist's marginalia, the evidence that the work was observed and catalogued, not asserted.

The system is editorial and dense with rigor, never a portfolio brochure. Work is filed, not displayed: engagements carry call numbers (ENG-INTUIT, PROJ-PP001), lab experiments are specimens you power on in place. Color is used with discipline: the paper and graphite carry the page, and the three brand colors (lime, blue, magenta) arrive as signal, on small percentages of any given surface. The result should read as credible, direct, and slightly edgy: the translation layer between learning science and language that gets funded.

It explicitly rejects the aesthetics of its neighbors. Not "passionate about learning" generic L&D. Not the AI-hype voice of bare-category headlines and trademarked-framework theater. Not the SaaS-cream portfolio (Notion white plus one accent). Not the hero-metric template. The proof here is the work and the client list, framed as field evidence.

**Key Characteristics:**
- Warm paper ground with tactile grain, never stark white
- Bauhaus display, lowercase, oversized; JetBrains Mono for all small chrome
- Work catalogued under call numbers, not laid out as cards
- Three brand colors as signal, disciplined to small surface percentages
- Direct, credibility-forward, slightly edgy; no filler, no jargon

## 2. Colors

A warm-neutral paper system carrying three high-signal brand colors used sparingly, with a graphite-and-lime backbone.

### Primary
- **Signal Lime** (#96E650): The brand's charge. Confirmation and payoff, the color the page resolves to. Used on button hover, the logo mark accent, the "is-live" specimen dot, and the lime bar that lifts to reveal the hero headline. High-energy, so it earns its rarity.

### Secondary
- **Field Blue** (#03599B): The credibility color. Italic emphasis in running text, Action-Mapping rungs in the measurement matrix, methodology labels, the logo word. **Field Blue Deep** (#024378) is its pressed/hover state.

### Tertiary
- **Editorial Magenta** (#EC008C): The interaction and accent color. Links on hover, focus rings, the italic display payoff (the hero "adopt."), Kirkpatrick rungs, section kickers. Reserved for display sizes and true accents.
  - **Magenta Ink** (#BC006B): The small-text magenta. Bright Editorial Magenta fails contrast below ~24px, so kickers, captions, and labels on light grounds use this deeper magenta instead.
  - **Magenta Lift** (#F24DAF) and **Blue Lift** (#6FA3CC): The dark-panel variants. On the dark bench ground, small magenta and blue labels lift lighter rather than darker, so they clear contrast.

### Neutral
- **Warm Ash Paper** (#f2efe8): The page ground. Never #fff. Carries a faint grain via a fixed multiply-blend noise layer.
- **Paper Shadow** (#e8e3d8): The recessed panel tone, for stat blocks, lab cards, and inset surfaces one step below the page.
- **Graphite Ink** (#282828): Primary text, dark section grounds, and the resting fill of pill buttons. Not pure black.
- **Ash Gray** (#5c5c5c): Secondary text, captions, metadata, placeholders. Deepened from #686868 to clear WCAG AA on paper and tinted panels.
- **Hairline** (#d6d3cc): 1px rules, input borders, dashed dividers.
- **Night Ground** (#141414): The deepest section grounds (the bench and dark editorial blocks).

### Named Rules
**The Paper Rule.** The page ground is Warm Ash Paper (#f2efe8), never #fff and never pure #000. Every neutral is tinted warm. Pure white appears only as an input's focused state, a lifted surface deliberately brighter than the page.

**The Small-Magenta Rule.** Bright Editorial Magenta (#EC008C) is for display and true accents only, at ~24px and up. Any magenta text below that uses Magenta Ink (#BC006B) on light grounds or Magenta Lift (#F24DAF) on dark grounds. The bright magenta never sets a kicker, caption, or label.

**The Signal Rule.** Lime, blue, and magenta are signal, not surface. On any given screen they occupy a small percentage; paper and graphite do the structural work. Rarity is what makes the lime land.

## 3. Typography

**Display Font:** Bauhaus Bool 600/700 (with Futura, Century Gothic fallback). Loaded locally from a .woff, not Google Fonts.
**Body Font:** DM Sans 400-600 (with system-ui fallback).
**Label/Mono Font:** JetBrains Mono 400-500 (with ui-monospace fallback).

**Character:** A geometric, almost cartoonishly confident display face against a clean humanist sans, with a technical monospace doing all the marginalia. The pairing reads as an opinionated designer's notebook: big lettered statements, quiet legible argument, precise field stamps.

### Hierarchy
- **Display** (700, clamp(3.5rem, 13vw, 11rem), line-height 0.92, lowercase, -0.02em): Hero headlines only. Oversized, tight, lowercase. Often revealed by a lime curtain bar that lifts away.
- **Headline** (700, clamp(1.9rem, 3.8vw, 3.1rem), line-height 1.1): Section titles ("engagements. filed and catalogued.").
- **Title** (700, clamp(1.25rem, 2vw, 1.65rem), line-height 1.05, lowercase): Card and dossier names, specimen headings.
- **Body** (400-500, ~1.1rem, line-height 1.55): Running text. Capped at 54-75ch. `text-wrap: pretty` on paragraphs, `balance` on headings.
- **Label** (500, 0.68rem, letter-spacing 0.14em, UPPERCASE): Mono kickers, field-note stamps, call numbers, captions, timestamps. The field-journal chrome.

### Named Rules
**The Mono-Chrome Rule.** JetBrains Mono is only ever small editorial chrome: kickers, metadata stamps, codes, captions, field-journal labels. It is forbidden for display and body copy. It carries the anthropology-field-journal voice and loses it the moment it gets large.

**The Lowercase Rule.** The display face and the brand wordmark are always lowercase. "caboodle design", "ai rollouts that humans actually adopt." Lowercase is the house voice, not a bug.

## 4. Elevation

A flat paper world where surfaces lift with long, soft, low-opacity shadows. There is no 2014-app drop shadow anywhere: shadows are large in blur, negative in spread, and low in alpha, so a lifted dossier or the bench specimen reads as a physical card resting on paper, catching a diffuse light. Depth is also carried tonally, Paper Shadow (#e8e3d8) recesses a panel below the page without any shadow at all.

### Shadow Vocabulary
- **Resting lift** (`box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 10px 30px -16px rgba(40,40,40,.35)`): Dossier cards and panels at rest.
- **Hover lift** (`box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 26px 50px -22px rgba(40,40,40,.45)`): The same card raised on hover, paired with a small translateY.
- **Bench stage** (`box-shadow: 0 30px 70px -20px rgba(0,0,0,0.55)`): The live specimen frame, dramatically lifted off the dark ground.
- **Tinted glow** (`box-shadow: 0 40px 60px -30px rgba(3,89,155,0.45)`): Occasional brand-tinted throw under a hero surface.

### Named Rules
**The Long-Throw Rule.** Shadows are long, soft, and low-opacity with negative spread. If a shadow looks tight, dark, or small-blur (a 2014 app card), it is wrong. Surfaces are flat at rest and lift as a response to hover or focus, never decoratively.

## 5. Components

### Buttons
- **Shape:** Full pill (border-radius 999px). No sharp-cornered buttons.
- **Primary:** Graphite Ink (#282828) fill, Warm Ash Paper text, DM Sans 600, padding 0.85rem 1.4rem.
- **Hover / Focus:** Fill flips to Signal Lime with Graphite Ink text over 0.4s on the house ease; any inline arrow slides 4px right. Keyboard focus adds a 2px Editorial Magenta ring at 2px offset.
- **Nav CTA:** The same pill, smaller (0.6rem 1.25rem), pinned in the header.

### Cards / Dossiers
- **Corner Style:** 10px (var(--r-card)). One signature variant uses an asymmetric dog-ear (10px 10px 3px 10px) to read as a filed folder tab.
- **Background:** Warm Ash Paper or Paper Shadow; white only for a deliberately lifted preview surface.
- **Shadow Strategy:** Resting lift at rest, Hover lift on hover with a small translateY (see Elevation).
- **Border:** 1px Hairline or none; never a colored side-stripe.
- **Distinctive behavior:** Each entry leads with a mono call number (ENG-INTUIT), a metadata line, then a lowercase Bauhaus title. Work is catalogued, not captioned.

### Inputs / Fields
- **Style:** 1px Hairline (#d6d3cc) border, square corners, Warm Ash Paper background, DM Sans 1rem, Ash Gray placeholder.
- **Focus:** Border shifts to Editorial Magenta and background lifts to white. No glow.

### Navigation
- **Style:** Lowercase DM Sans links with an animated underline (an ::after that wipes in from the left on hover). The CTA is the primary pill and never gets the underline.
- **Mobile:** A 44px hamburger toggles a full-width paper panel with oversized stacked links and the pill CTA. The panel's own targets are generous; the header row is compact.

### The Bench (signature component)
A dark-ground stage (#282828) holding operable specimens on a tab switcher. Each specimen powers on in place: a poster gives way to a live iframe wrapped in minimal browser chrome (lime traffic-dot, mono URL stamp), with field-note annotations ("what it is / why it matters / the point") down the side in mono. Only one specimen is live at a time. This is the "run it, don't read about it" thesis made physical.

## 6. Do's and Don'ts

### Do:
- **Do** ground every page in Warm Ash Paper (#f2efe8) with the grain layer. Tint every neutral warm.
- **Do** keep JetBrains Mono to small chrome: kickers, stamps, call numbers, captions.
- **Do** set the display lowercase and oversized, and let a lime curtain bar reveal it.
- **Do** file work under call numbers with mono metadata, the field-journal way.
- **Do** use Magenta Ink (#BC006B) / Magenta Lift (#F24DAF) for small magenta text; reserve bright #EC008C for display.
- **Do** lift surfaces with long, soft, negative-spread shadows, only on hover or focus.

### Don't:
- **Don't** write "passionate about learning" energy, or any generic L&D filler.
- **Don't** use the AI-hype voice: bare-category headlines ("Generative AI"), aspirational reinvention frames, or trademarked-framework theater.
- **Don't** ship a SaaS-cream portfolio (Notion-style white plus one accent), or the hero-metric template (big number plus supporting stats).
- **Don't** build identical card grids of icon + heading + text.
- **Don't** use gradient text or glassmorphism. Emphasis comes from weight, size, and the brand colors.
- **Don't** use a border-left or border-right greater than 1px as a colored accent stripe. The measurement matrix's 2px methodology edge is the one tolerated, semantically-encoded exception, and even it should carry a non-color cue.
- **Don't** use an em dash anywhere except the official tagline: "Strategy, media, and behavioral science — it's the whole caboodle."
- **Don't** use pure #fff as a page ground or pure #000 for text.
