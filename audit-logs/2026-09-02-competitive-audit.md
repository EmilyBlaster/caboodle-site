# Audit: competitive — 2026-09-02

**Scope:** caboodledesign.info vs. https://portfolio-farahcurioevproject.vercel.app/ (Farah Ruhomtally, L&D portfolio)
**Command:** competitive site audit
**Run by:** Emily

**Method note:** The competitor domain, our live domain, and archive.org are all blocked by this session's network policy. Competitor findings come from search-engine indexes of the site (title, description, and indexed body text). Our side was audited from the repo source, which is what deploys to production. Anything not verified visually is marked as such.

---

## What their site is

- **Owner:** Farah Ruhomtally, learning designer, based in Mauritius. Montessori background.
- **Positioning:** "designs learning experiences that connect strategy, systems thinking, and human-centered design." Process starts with a "designer brain" phase (rapid idea exploration), then aligns to learning theories, frameworks, and org goals.
- **Audience:** hiring managers and recruiters. This is a job-seeker portfolio, not a consultancy site. Contact is a Gmail address plus LinkedIn.
- **Structure:** single page with anchor nav (`#about`), Next.js on Vercel. Poppins type. Sections indexed: about, projects, design system.
- **Projects indexed (3):**
  1. **AI Cooling Lab** eLearning course. Five-screen scenario where the learner is a data-centre operator optimizing AI cooling and eco-materials. Live, playable. Comes with a screen-by-screen build doc mapping every screen to ADDIE and MAP-IT, with WCAG 2.2 criteria applied.
  2. **Eco-cafe vertical farm** onboarding. Immersive diagnostic simulation for new hires. Framed against a real performance gap ("manuals don't prepare people for visual, procedural, situational tasks").
  3. **ID artefact review agent** on Gemini Gems. Takes storyboards, proposals, outlines, decks. Scores them against ADDIE, Bloom's, Kirkpatrick, Adult Learning Theory, and performance-based L&D. Outputs gaps, risks, prioritized recommendations, and stakeholder-ready justification language.
- **Design system section:** published palette with contrast ratings, Poppins type scale, component specs, WCAG 2.2 standards.
- **Proof:** none indexed. No client names, no outcome numbers, no testimonials. Projects appear to be self-initiated or speculative.

## Where they are stronger

1. **Every project is playable.** The flagship course is live on the page. A recruiter can click and be inside the work in ten seconds. Our case studies are dossiers about the work; the live artefacts sit in `work/embeds/` and inside iframes on the homepage and some case pages, but the "try it" path is not the headline of any work page.
2. **Build transparency.** The screen-by-screen document with framework mapping per screen and WCAG criteria per screen is a strong hiring-manager signal. It shows the thinking, not just the result. We describe our method on the approach page and reference frameworks in case studies, but no case study exposes a storyboard, build doc, or design decision log.
3. **Accessibility as a visible feature.** WCAG 2.2 is named in the meta description and on every project. We mention WCAG twice on the whole site (home and about), in passing, and our own May audit still has open items (skip link, nav ARIA state, reduced-motion in View Transitions). Their claim is stronger than ours on the surface even though our site is likely further along under the hood.
4. **A public design system.** Palette with contrast ratios, type scale, component specs. We have DESIGN.md and DESIGN.json in the repo and they are arguably better, but none of it is public.
5. **The AI tool is the sharpest project.** An agent that reviews ID artefacts against five frameworks is the kind of thing a Fortune 500 L&D lead would actually forward to a colleague. Our labs page has eight experiments, including the stakeholder review system and greenroom, which are more ambitious, but they are pitched as a bench of experiments rather than one tool a buyer could try today.
6. **Lighter and faster (unverified).** Next.js single page on Vercel with one Google font. We ship 214 KB of CSS, 69 KB of JS on every page (JS also re-executes inside every preview iframe), 83 MB of assets in the repo, and two 1.9 MB standalone figure pages linked from the approach page.

## Where we are stronger

1. **Proof.** Apple, Airbnb, GitLab, Intuit, T-Mobile, Trust20, J&J. Real numbers: 95% completion across 251 suppliers in 31 countries, 3x internal mobility applications at Intuit, legal inquiries cut 40%. They have zero of this. This is the gap they cannot close and it should be even louder.
2. **Positioning.** We sell an outcome (AI rollouts that humans actually adopt) to a named buyer (transformation leads, CLOs, AI program owners) with two scoped paths (fractional, full-time). They sell a skill set to whoever is reading.
3. **Method depth.** Action Mapping x Kirkpatrick with client proof at each level, a five-phase engagement arc, animated figures. Their ADDIE and MAP-IT mapping is a checklist. Ours is an argument.
4. **Breadth of surface.** Seven case studies, eight labs, six free resources, field notes fed from TikTok, a contact form that routes. They have one page.
5. **Brand.** Custom display type, paper grain, field-log sidebar, dossier numbering. Distinct and memorable. Theirs is a Poppins template.
6. **Distribution.** TikTok and LinkedIn feed the field-notes page. They have a LinkedIn link.
7. **Real accessibility engineering.** Skip link and WCAG AA near-miss fixes landed in the last two commits. Seven reduced-motion rules. Their WCAG 2.2 claim is on the page; ours is in the code.

## Recommendations

### Critical (do these)

- [ ] **Put a "try it" button above the fold on every case study that has a playable artefact** — work/apple.html, work/gitlab.html, work/airbnb.html, work/peoples-professors.html, work/trust20.html, work/spot-the-strategy.html already contain iframes — make the live sample the first thing after the headline, not something found by scrolling. This closes their single biggest advantage in one afternoon.
- [ ] **Publish one build-transparency artefact** — pick the Apple or Intuit case and add a "how it was built" section: the action map, one storyboard spread, the measurement plan, and the WCAG checklist actually used. One case is enough. It proves the approach page is not theory.
- [ ] **Say "WCAG 2.2 AA" once per case study, in the results block** — the code work is done, the claim is missing. Add a one-line standards note where the metrics live.

### Important (this month)

- [ ] **Promote one labs tool to a buyer-facing demo** — labs/stakeholder-review.html or labs/greenroom.html — give it its own "try it with your own doc" entry point, positioned for a CLO, not a peer. Their Gemini agent is the project people will remember; ours are more ambitious and less visible.
- [ ] **Publish the design system** — DESIGN.md already has tokens, type scale, and rules. A `/design-system` page with palette contrast ratios and component specs turns internal rigor into a public credibility signal and doubles as a labs entry.
- [ ] **Close the three open accessibility items from the May audit** — skip link on all pages (check whether the last two commits covered every page), `aria-expanded` and `aria-controls` on the mobile nav button, reduced-motion guard on the View Transitions call in script.js.
- [ ] **Add robots.txt, sitemap.xml, and Person/Organization JSON-LD** — none exist. Their single page is trivially indexed. Our seven case studies and eight labs are not being helped by anything.
- [ ] **Performance pass** — delete the dead WORK PEEK IIFE in script.js (about 170 lines), stop loading script.js inside preview iframes, and move engagement-arc.html and fig-02-ladder.html (1.9 MB each) off the approach page critical path or shrink them.

### Nice to have

- [ ] Testimonials on about.html currently use `<div>`; switch to `<blockquote>` and `<cite>`, and surface one quote on the homepage near the client logos.
- [ ] A one-line "based in / working with" location signal. They state Mauritius. We state nothing, which matters for US enterprise buyers who want to know time zone.
- [ ] Field-notes subscribe form still posts to `mailto:`; route it through FormSubmit like contact.html.

## Verdict

They are not a competitor for the consulting buyer. They are a well-built junior portfolio with one very good idea: make the work playable and show the build. We win on every proof, positioning, and brand dimension. The three things to steal are the try-it-first case study layout, one published build document, and the WCAG claim stated out loud. Do those and there is nothing on their page we do not do better.

---

## Shipped 2026-09-02 (same day, branch `claude/competitive-site-audit-2it2av`)

- [x] **Try-it CTA above the fold** on all seven case studies (apple, gitlab, airbnb, intuit, t-mobile, trust20, people's professors). New `.casehero__try` pill jumps to the live artefact section, which now carries an id. Mobile verified.
- [x] **Build log on the Apple case** (`work/apple.html`, `.buildlog` ledger): action map, delivery decisions, measurement plan by Kirkpatrick level, accessibility checklist. Uses only facts already on the page; the confidentiality note is explicit.
- [x] **Standards line** (`.results__standards`) under every results stack. Says "built to wcag aa" plus the page-specific requirement (localization, accreditation). *Emily to confirm the WCAG version and level per engagement before it goes live if she wants a version number.*
- [x] **Greenroom promoted to a buyer-facing demo** on `work.html` (`.rundemo`): "try it with your own question", live link, build-log link, poster with browser chrome.
- [x] **Design system published** at `design-system.html`: north star, every color token with computed WCAG contrast on paper and on ink, type specimens, elevation, live components, motion, the accessibility standard, do and don't. Linked from every footer.
- [x] **Skip link on all 25 public pages**, visible on focus, targeting the first content section.
- [x] **robots.txt, sitemap.xml** (25 URLs with git lastmod), **JSON-LD** (Organization, Person, WebSite on home; ProfilePage on about).
- [x] Stylesheet cache token bumped to `20260902a` everywhere; RECOVERY.md updated.

### Already handled before this audit (found while implementing)
- Mobile nav `aria-expanded` and `aria-controls`: present in `script.js`.
- Reduced motion for view transitions: handled in `styles.css` `@media (prefers-reduced-motion)`.
- WORK PEEK dead IIFE: already removed. `.planning/codebase/CONCERNS.md` section 1.1 is stale.
- Heavy IIFEs (field guide, cursor glow, touch ripple) already skip inside preview iframes.
- `engagement-arc.html` and `fig-02-ladder.html` load lazily via `data-src`, so they sit off the critical path. Still 1.4 MB gzipped each; worth shrinking later, not blocking.

### Still open
- Field-notes subscribe form still posts to `mailto:`.
- Testimonials on about.html still use `<div>` instead of `<blockquote>` and `<cite>`.
- Carousel slide changes are not announced (`aria-live`).
