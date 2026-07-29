# Decidedly Wealth Management — Design Brief

## The Client
Sanger Smith, Founder of Decidedly Wealth Management. Fort Worth, TX.
CEPA + BFA + APMA. Two published books. Father-son podcast (752 episodes).
Serves family business owners navigating exit planning.
~100 clients, $12K/yr avg. Goal: 10 new clients in 6 months.

## The Audience
Family business owners in DFW with $2M-$20M+ in business value.
Approaching exit. Emotional, not just financial. Need trust, expertise, and a human who's lived it.

## The Single Job of This Site
Make the next family business owner in Fort Worth who Googles "exit planning" find Sanger first — and feel confident enough to book a conversation.

## Design Direction

### Vibe
Warm authority. Not corporate cold. Not startup casual.
Think: a well-designed private office — dark wood, warm light, the smell of leather and good coffee.
"Lightheartedness and humility" (Sanger's own words about his approach).
Editorial quality — this is a published author, not a template advisor.

### Color Palette
- **Primary dark:** #0F0F0F (near-black — not pure black)
- **Surface:** #1A1714 (warm dark — slight brown undertone, like dark walnut)
- **Warm accent:** #C8956C (burnished gold/copper — trust, warmth, not flashy)
- **Text primary:** #E8E0D4 (warm cream — not pure white)
- **Text secondary:** #9A9080 (muted warm gray)
- **CTA/highlight:** #D4883A (amber — action, warmth)
- **Success/trust:** #6B8F71 (sage green — growth, stewardship)

AVOID: Purple gradients, neon accents, pure black/white, anything that reads "fintech startup"

### Typography
- **Display:** Cormorant Garamond or similar editorial serif — used for headlines only, with restraint
- **Body:** DM Sans or similar humanist sans — clean, warm, readable
- **Utility:** JetBrains Mono or similar monospace — for labels, credentials, small data
- Set a clear type scale. Headlines are large and confident. Body is comfortable. Nothing screams.

### Signature Element
The father-son story. This is what no competitor can copy.
The site should feel like Sanger is talking to you — the podcast voice, the book author voice, not a corporate brochure.
One scroll-triggered moment that reveals the story: "He took over his father's firm. Then he built his own. Now he helps others do the same."

### Layout Principles
- Generous whitespace — let content breathe
- Full-width hero with subtle ambient motion (not a video background — a slow pan or parallax)
- Asymmetric grid for the story sections (not everything centered)
- Cards for services, but not generic rounded-corner cards — more editorial, more textured
- Mobile-first — 60%+ of traffic will be phone

### Motion & Animation
- CSS scroll-driven animations (animation-timeline: view(), animation-range: entry)
- Fade-in on scroll for sections — subtle, 0.6s ease
- Hero: slow parallax or subtle zoom on scroll
- Numbers/stats: count-up animation when entering viewport
- Alternate rhythm: animated section → breathing section → animated section
- NO: bouncing, spinning, excessive parallax, anything that feels "tech demo"
- RESPECT prefers-reduced-motion

### Hero Concept
Dark, full-width. Not "Welcome to Decidedly Wealth."
Instead: "You built something worth millions. Let's make sure you leave on your terms."
Subtle texture or gradient in the background — warm, not cold.
One CTA: "Book a Decision Lab Session"
Below: credentials bar (CEPA + BFA + APMA + Published Author + 100+ Families Guided)

### Content Sections (Homepage)
1. Hero — thesis statement + CTA + credentials
2. The Decidedly Difference — three pillars: Published Author, Father-Son Podcast, CEPA Certified
3. Services Journey — Growth → Pre-Exit → Post-Exit → Legacy (horizontal or visual timeline)
4. The Decision Lab — proprietary process, branded, feels like a product
5. Sanger's Story — editorial, full-width, the father-son narrative
6. Books — side by side covers, "Get Chapter 1 Free" CTA
7. Podcast — latest episodes with embeds
8. Trust signals — Google reviews (coming), EO Fort Worth, Kestra affiliation
9. CTA — "Your first conversation is free."

## Design Inspiration Sources
- Integrated Wealthcare (Awwwards) — sophisticated minimal, charcoal + orange accent, generous whitespace
- Meridian — dark atmospheric, magical color accents, space-like
- Shark Financial — deep black + mint, minimalist text, partner logos for credibility
- Navy + gold aesthetic with Cormorant Garamond / Montserrat
- Editorial magazine layouts — asymmetric grids, large type, photography-forward

## Technical Constraints
- Static HTML + CSS + JS (no framework — deployed on Vercel)
- Google Fonts only (Cormorant Garamond, DM Sans, JetBrains Mono)
- CSS scroll-driven animations (supported in Chrome, Safari 18+, Firefox behind flag)
- Intersection Observer fallback for older browsers
- Must pass Lighthouse performance 90+ (static HTML = easy)
- Must be fully responsive (mobile-first)
- Must respect prefers-reduced-motion
- No external dependencies (no GSAP, no Tailwind — pure CSS)

## Anti-Patterns to Avoid
- Inter font
- Purple/blue gradients
- Rounded cards with shadows (the "SaaS template" look)
- Numbered steps (01 / 02 / 03) unless content is truly sequential
- Stock photography of handshakes or people pointing at charts
- "Let's get started" as a CTA (say what actually happens)
- Generic testimonial carousels
- Hamburger menu on desktop
- Cookie-cutter footer with 47 links nobody clicks
