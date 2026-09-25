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

## Current Build Status (as of Aug 5)
- **21 pages LIVE** at decidedly-preview.vercel.app
- **Brand style guide applied:** bold+italic rule (one word only, used sparingly), real logo, hi-res photos from Drive
- **Team photos:** Brick wall photos from Light_Edits Drive folder, cropped to 600x600 square. CSS handles circular clipping via `.tm-photo img` and `.bio-photo img` rules (object-fit:cover, display:block). Containers no longer use display:flex. Sanger=brick-5, RJ=brick-15, Wyatt=brick-24 (wider framing). Dori still uses old 320x320 circular PNG.
- **Service page images:** 7 AI-generated (Gemini) editorial photos across services.html, exit-planning.html, business-succession-planning.html, business-valuation.html, post-exit-wealth-management.html. All named `ai-*.jpg`, 1200px wide.
- **Podcast section:** YouTube cover art (Sanger + Shawn at mics) replaces standalone logo. File: podcast-cover.jpg (600x600 from YouTube channel avatar).
- **Books page:** "About the Authors" section uses podcast-cover.jpg (both authors).
- **All old photos replaced:** Sanger replied "update them all so I have a buzz cut" — done. Zero old headshots remain. sanger-brick.jpg on all solo Sanger spots, podcast-cover.jpg on all father-son spots.
- **All pages wired up:** No orphaned pages. Footer has Podcast + Books + Privacy + Disclosures. Services page links to sub-pages. Exit planning links to succession/valuation/CEPA. All 5 geo pages have "Your Advisor" section with photo.
- **Google Ads:** Campaign plan drafted in Drive (Doc ID: 1YVyehnVgoVsjMTxWmFgbvbC2z4_gb1NUx5dljAGvtR4). API access confirmed (account 8793593741, ~/google-ads.yaml re-authed Aug 5). Blocked on Sanger's card.
- **Vercel auto-deploy is WORKING** — push to main auto-deploys to decidedlywealth.com in ~30s (vercel.json added Aug 24).
- **GitHub repo is PUBLIC** (required for RJ's Claude.ai MCP connector)
- **RJ Finley (richfin3)** has read+write access via Claude.ai GitHub MCP connector. He commits to his fork and opens PRs.
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

## Session Log — Sep 25, 2026

### Published
- `blog/i-thought-id-feel-free.html` (RJ, scheduled Oct 7 — emotional side of the exit)
- `blog/all-your-eggs-in-one-basket.html` (RJ, scheduled Oct 14 — concentrated stock position)
- Both built from the `whats-your-business-really-worth.html` template. Gated, Article schema, canonical, per-post gate source IDs so downloads attribute to the right post.
- Added to Insights index + sitemap. Commit `ff5c29c`.
- **RJ's own writing is pre-approved — it does NOT need Dori/Kestra review.** Only content we author does.

### Current verified counts (do not trust older numbers in this file)
26 HTML pages | 29 sitemap URLs | 25 canonicals | 15 pages with schema blocks.

### Spam filter
`api/_spam-filter.js` — honeypot, sub-3s submit, disposable domains, numeric/fake locals, gmail dot-alias abuse (4+ dots), random-name detection (3+ inner caps, or <22% vowels on 8+ letters), URL stuffing. **Only blocks on missing name when BOTH first and last are empty** — the blog popup collects first name alone and real leads come in that way. Took junk book downloads from 19/48h to zero.

### Reply routing (lives outside this repo)
`~/reply-webhook/src/api/webhook.js` on Vercel, alias reply-webhook-ten.vercel.app. Routes Reply.io prospect replies to the owning advisor by sequence-name prefix ("rj //", "wyatt //", "sanger //"). Sends full conversation history from `/v3/contacts/{id}/activities`, LinkedIn URL, firmographics. Reply-To is channel-aware: email replies go back to the prospect, LinkedIn replies go to Matt only because genmail.com addresses are placeholders, not inboxes.

### Google Ads
Account **8793593741**. `login_customer_id` must equal that account, not the MCC.
Sep 16-22 vs Sep 9-15: clicks 25 → 53, CPC $11.14 → $6.71, CTR 5.3% → 7.2%, conversions 0 → 2.
**The refresh token in ~/google-ads.yaml expires every ~7 days** (Testing-mode OAuth client). Re-auth with /tmp/reauth_gads.py, or fix permanently by setting the OAuth consent screen to "In production".

### Client comms rules learned this session
- Never frame delivered work as a problem we discovered. "The search foundation went live", not "Google had no map of the site." Matt: *"that makes us look bad."*
- Verify claimed firsts against what the client has already reported. Wyatt had counted 5-6 leads and Sanger had meetings before Mark Bishara booked; Mark's real distinction is that he was a cold-email win, which is rare.
