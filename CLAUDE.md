# Decidedly Wealth Management — Site Build

## Project Overview
New website for Sanger Smith / Decidedly Wealth Management. Replacing FMG Suite.
- **Client:** Sanger Smith, sanger@decidedlywealth.com
- **Engagement:** Accelerator, $6,900/mo, 12 months, signed Jul 24
- **Domain:** decidedlywealth.com (DNS switch from FMG to Vercel when ready)
- **Preview URL:** deploy to Vercel as decidedly-preview for now
- **Kickoff call:** Jul 30 — COMPLETED

## Brand Style Guide Rules (FROM SANGER — MANDATORY)
- **Font:** Playfair Display for headings (NOT Cormorant Garamond — updated after kickoff)
- **Bold+italic:** ONLY used together, never separately. Only ONE WORD at a time gets the treatment.
- **Book titles:** Use `<cite>` tag (regular italic), NOT `<em>` (which triggers bold+italic in headings)
- **Nav logo:** Real DWM logo images (white for hero overlay, dark for scrolled state)
- **Team photos:** Circular containers (border-radius: 50%), not rectangular
- **CSS rule:** `h1 em, h2 em, h3 em { font-style: italic; font-weight: 700; }`

## Compliance Rules
- ALL content goes to Dori Stone (dori@decidedlywealth.com) for compliance review before publishing
- Sean Smith (Sanger's father) CAN appear in group photos and podcast mentions
- Sean CANNOT be listed as a team member of Decidedly Wealth Management (separate entities, broker dealer issue)
- Use ONLY existing approved content — do NOT invent stats, pricing, or claims

## Key Files
- **DESIGN-BRIEF.md** — Full creative direction, color palette, typography, layout, motion plan
- **Desktop/_Client Projects/Sanger Smith/site-plan.md** — Complete site architecture (25+ pages)
- **Desktop/_Client Projects/Sanger Smith/content-dump/full-content-audit.md** — Every page audited: 12 keep, 242 kill

## Design Skills Installed (.claude/skills/)
12 skills loaded — frontend-design, ui-ux-pro-max, web-designer-plugin, web-design, high-end-visual-design, antigravity-design-expert, design-taste-frontend, scroll-experience, ui-motion, emotional-arc-designer, landing-page-generator, awesome-claude-design

## Tech Stack
- Static HTML + CSS + vanilla JS (no frameworks)
- Google Fonts: Playfair Display (display), DM Sans (body), JetBrains Mono (utility)
- CSS scroll-driven animations (animation-timeline: view(), scroll())
- Deployed on Vercel
- Must pass Lighthouse 90+

## Content Sources
- Team bios from FMG who-we-are page (Sanger, RJ, Wyatt, Dori, Morgan)
- Services: Growth → Pre-Exit → Post-Exit → Legacy
- 752 YouTube podcast episodes (@decidedlypodcast)
- 2 books: "Decidedly Wealthy" + "A Life Rich with Significance"
- Proprietary process: "The Decision Lab" (details TBD from Sanger)
- Office: 6100 Camp Bowie Blvd Suite 24, Fort Worth TX 76116
- Phone: 817-615-9711
- Compliance: Kestra Investment Services (FINRA/SIPC)

## Build Order
1. Homepage (hero → difference → services journey → Decision Lab → Sanger's story → books → podcast → trust → CTA)
2. Exit Planning page (the #1 SEO target)
3. Sanger's Story page
4. Then remaining service pages, location pages, team pages

## Design Anti-Patterns (DO NOT)
- Inter font, purple gradients, rounded SaaS cards
- Stock photos of handshakes or people pointing at charts
- Generic "Let's get started" CTAs
- Numbered steps (01/02/03) unless truly sequential
- Cookie-cutter footer with 47 links
- Hamburger menu on desktop

## Current Build Status (as of Aug 3)
- **21 pages LIVE** at decidedly-preview.vercel.app
- **Brand style guide applied:** bold+italic rule (one word only, used sparingly), real logo, hi-res photos from Drive
- **Hi-res photos pulled from Google Drive** (Wealth.com Photoshoot folder): 3 distinct Sanger shots (sanger-smith-hires.jpg = smiling/CU0A3184, sanger-contemplative.jpg = serious/CU0A3177, sanger-relaxed.jpg = wider/CU0A3173). Family couch photo from 2025 Photoshoot.
- **Team photos:** Matt exported uniform circular crops from Canva (baked-in circle PNGs). Container uses border-radius:50%, object-fit:cover, no background/border. Don't try to process the PNGs with ImageMagick — the circles are baked into the pixels.
- **Vercel auto-deploy is NOT working** — must run `vercel --prod` manually from the project directory after every push.
- **Only page remaining:** The Decision Lab (waiting on Sanger for process details)

### All 21 Pages
1. index.html (homepage)
2. who-we-are.html
3. services.html
4. contact.html
5. books.html
6. exit-planning.html (#1 SEO target + Google Ads landing page)
7. sangers-story.html (editorial layout, unique feel)
8. business-succession-planning.html
9. business-valuation.html
10. post-exit-wealth-management.html
11. family-business-advisory.html
12. cepa-explained.html
13. exit-planning-fort-worth.html
14. exit-planning-dallas.html
15. exit-planning-southlake.html
16. exit-planning-frisco.html
17. exit-planning-arlington.html
18. who-we-serve.html
19. podcast.html
20. privacy.html
21. disclosures.html
- **Keyword data:** ~/Desktop/_Client Projects/Sanger Smith/keyword-data.md (DataForSEO, real CPC/vol/competition)
- **Site plan:** ~/Desktop/_Client Projects/Sanger Smith/site-plan.md (full 25+ page architecture)
- **Content audit:** ~/Desktop/_Client Projects/Sanger Smith/content-dump/full-content-audit.md
- **Assets:** ~/Desktop/_Client Projects/Sanger Smith/assets/ (logos, headshots, books, 2025 photoshoot, linkedin banner)

## Starting Next Session
1. Read DESIGN-BRIEF.md for creative direction
2. Read styles.css + index.html to match existing patterns
3. Read the content audit for Exit Planning source content from FMG
4. Read keyword-data.md for SEO targeting
5. Build the Exit Planning page following brand rules above
