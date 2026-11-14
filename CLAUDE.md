# Decidedly Wealth Management — Site Build

## Project Overview
New website for Sanger Smith / Decidedly Wealth Management. Replacing FMG Suite.
- **Client:** Sanger Smith, sanger@decidedlywealth.com
- **Engagement:** Accelerator, 12 months, signed Jul 24 (terms in private notes)
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
- ALL content gets compliance approval before publishing. Since Oct 14, 2026 RJ submits each item himself (ticket numbers T1, T2, ...). We prepare a ready-to-paste packet per ticket: PDFs in a public Drive folder + a row on BOTH tabs of the compliance tracker (Queue + Submit card view). RJ asked that both tabs stay current.
- Publish exactly what was approved. Approved items go live only after RJ forwards the approval notice.
- BANNED WORD (RJ + Wyatt, Oct 19 2026): never use "take" in any form (takes, taken, taking, takeaway, mistake). Check with `grep -n -i -E '\b\w*tak\w*\b'`. No em or en dashes in new copy.
- **From Mon Oct 5 2026 Shawn is a Decidedly advisor (Sanger, Sep 30): no restrictions.** Before that: Shawn Smith (Sanger's father) CAN appear in group photos and podcast mentions
- Shawn CANNOT be listed as a team member of Decidedly Wealth Management (separate entities, broker dealer issue)
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
OAuth app is IN PRODUCTION (verified Sep 30). Re-auth if ever needed: `python3 ~/scripts/reauth-google-ads.py`. Connection is monitored hourly by `~/scripts/connection-health.py` (Telegram alerts). Never report Ads status from memory, run the check.

### Client comms rules learned this session
- Never frame delivered work as a problem we discovered. "The search foundation went live", not "Google had no map of the site." Matt: *"that makes us look bad."*
- Verify claimed firsts against what the client has already reported. Wyatt had counted 5-6 leads and Sanger had meetings before a prospect booked; the real distinction was that it was a cold-email win, which is rare.

## Session Log — Sep 30, 2026

### Shipped
- **RJ weekly report** `ops/rj-sync-sep30.html` LIVE. It includes the Ads week-over-week (Sep 23-29: 896 impr, 56 clicks, $6.22 CPC, 3 conv, $348.58). A lead who became a meeting is attributed to Google Ads.
- **RJ photo** `images/rj-brick.jpg` re-cropped from Drive original photo 24 (commit 20344f6).
- **Blog post** `blog/significance-over-success-rj-finley.html` on branch `rj-reeling-it-in` (commit 7681252). Preview only. NOT merged, because it goes through Dori/Kestra first.

### Podcast clips
- 5 audiogram clips come from RJ's Reeling It In episode.
  - Drive folder: 1mQ6RKWqCHPOk87WrLsTrrgO8ekwqxTvz.
  - Build pipeline: `~/scripts/podcast-clips/` (build.py helpers, build2.py pipeline, verify.py Deepgram QA, calendar.py sheet builder, music/ beds + energy.py).
- Content calendar sheet: 1QO1QAQ3sB1SSPCsJEAtHUUXDDtJSXw4i7C_24h8fyp8.
  - Columns: caption plus V2, first comment, compliance dropdown, RJ Approved, Posted.
- Flow: RJ approves, then one batch goes to Dori, then Matt schedules via the API scheduling tool once RJ connects LinkedIn. Target is 3 posts/week.

### RJ outreach sequence 1758256
- 91 contacts marked finished: RJ's 60, plus Partner titles, plus nonprofit boards. ISD contacts were already in RJ's 60.
- 231 active.
- Post-connect message changed via PUT to "I came across your business...".
- RESUMED via API Sep 30 (POST /v3/sequences/1758256/start). Active.

### Open
- RJ's exit-planning calculator (Claude artifact). Waiting on his link.
  - Short gated site version targeting "exit planning calculator".
  - Long version behind client login.
- New team photos incoming (Shawn + Aisha joining). Confirm with Dori before listing Shawn (broker-dealer rule above).
- Rule: booking context goes to the team by email, never in GReminders notes (the client sees those).

## Session Log: Sep 30, 2026 (evening)

### Exit calculator (branch `exit-calculator`, NOT merged)
- Files: `exit-planning-calculator.html`, `exit-calculator.js`, `exit-calculator.css`, `api/exit-calculator.js`.
- Preview: decidedly-preview-git-exit-calculator-mcretzman-9359s-projects.vercel.app/exit-planning-calculator.html
- Flow: 3 steps, free readiness score + gaps, email gate, then value range, after-tax net, wealth gap and upside.
- Leads: Levitate tag "Exit Calculator", alert emails to Sanger, RJ and Wyatt.
- Multiples are sourced (commit 64fda65): IBBA Market Pulse, GF Data, BVR DealStats, Pepperdine. Sources and methodology for Dori: `ops/calculator-multiples-sources.md`.
- Page is noindex until Dori approves. To launch:
  1. Merge the branch.
  2. Remove the noindex meta tag.
  3. Add the page to the sitemap and link it from exit-planning.html.
- nav.js fires the contact-form conversion on any form submit, including the gate. The calculator also fires the gtag events `exit_calc_complete` and `exit_calc_lead`.

### Platform direction (Matt's correction)
- DW is WEALTH management, not M&A. Platform = the owner's whole balance sheet, built around the five key decisions.
- Data sources: Black Diamond, MoneyGuide Pro, wealth.com, Wealthbox.
- The calculator is only the front door. Transaction-only owners go to a partner (Founders Advisors).
- Spec doc: 1pmYrhy32KgQ82KdRdVXeN-pMuYYgVwoACRKlYFa920w. Oct 1 agenda doc: 1ceaMnXkUt3QoSQGlwXekmCwqJ2sPvlllQalWQ1XvuSo. Both shared by name with Sanger, RJ and Wyatt.

### Comms rule
- Wyatt is on ALL Decidedly team comms (with Sanger and RJ).

### Social posting
- Postiz fixed. No Decidedly LinkedIn accounts are connected yet; connect RJ (and Sanger) in person via a one-time OAuth link from `GET /public/v1/social/linkedin`.
- Posting target is 3 per week (Matt's target).

### Sanger social strategy (Sep 30, late)
- Doc: 1JCnme2YTivNsSdDimSV99JoGgHl3FrQV7PlKPvOI2ac. Shared by name with Sanger, RJ and Wyatt.
- Channel data: `~/scripts/podcast-clips/decidedly-yt/`.
- YouTube @decidedlypodcast:
  - 752 uploads: 498 long-form, 254 Shorts.
  - Dormant since Sep 17, 2025.
  - Median views: 359 for Shorts, 6 for long-form.
- Plan: Sanger's personal LinkedIn is the primary channel, 3 posts a week, one back-catalog episode per week. The same clips also go to Shorts and the company page.
- First episodes to cut: Ep160, Ep180, Ep22, Ep141, Ep156, Ep171, Ep173, Ep108.
- `podcast.html` has stale claims: "new episodes every week" and "750 episodes". Fix after approval.
- Sanger's father is spelled **Shawn** D. Smith (site + YouTube), not Sean.
- The Oct 1 agenda has "Sanger's social media" as item 4.
- Edit shared Google Docs in place with `gws docs batchUpdate` so links stay stable.

## Session Log: Oct 1-3, 2026

### Preview branches (NOT merged; all pending Dori)
| Branch | What |
|---|---|
| `team-oct5` | Shawn D. Smith (Private Wealth Advisor; MBA, CFP, ChFC, APMA, BFA, CKA) + Aisha Ann Rada (Financial Planning Associate). Photos, no bios yet. Homepage team grid set to 3 columns. **Go live Mon Oct 5 once Dori approves.** |
| `team-photos` | Built on team-oct5. Real group shots replace ai-exit-planning.jpg and ai-growth.jpg, plus a team banner on Who We Are. |
| `podcast-copy` | "750+ episodes" changed to "nearly 200"; removed the weekly-release claims. |
| `exit-calculator` | Generic calculator with sourced multiples. |
| `rj-reeling-it-in` | RJ blog post. Merge before the Oct 12 LinkedIn post goes out. |
| `niche-calculators` | HVAC + dental calculators + industry landing pages (commit 46903d0). Upgrades in progress: audience images, sliders, dollar value levers, "what your exit buys", market momentum, roadmap. |

- Vercel shortens long branch names: niche preview = decidedly-preview-git-niche-cal-1c168c-mcretzman-9359s-projects.vercel.app.

### Social
- Postiz: Sanger + RJ LinkedIn connected. 13 posts loaded as DRAFTS; promote via PUT /posts/{id}/status after Dori approves.
- Ledgers: ~/scripts/podcast-clips/sanger/postiz/ and ~/scripts/podcast-clips/rj-postiz/.
- Clip rules:
  - Complete thoughts only, never cut a speaker mid-passion. 1-3 min is fine.
  - Music-swell outro + logo end card.
  - QA by re-transcription. Deepgram is out of credit, so use local whisper.
- Month 2 content in production: ~/scripts/podcast-clips/sanger-month2/.

### Google Ads
- STOPPED serving Oct 1: all 3 campaigns NOT_ELIGIBLE, reason unknown via API, likely billing.
- Needs a UI check by an account user. matt@stormbreakerdigital.com has no UI access.
- connection-health.py now fails the check if ads are not serving.

### Rules learned
- Wyatt is on all team comms.
- Five decisions exact wording: Decide who you are / Decide where you are / Decide where you are going / Decide how you are going to get there / Decide who matters.

## Reports (Oct 13, 2026)
- Weekly client reports are NOT kept in this repo. This repo is public on GitHub. Reports live in a separate private, password-protected project; see private notes.
- Old `/ops/rj-sync-*.html` addresses redirect there (vercel.json). `ops/dashboard.html` stays here: it has its own access key and shows no names.

## Session Log: Oct 19-23, 2026
- Oct 19: all site forms were rejecting real visitors since Sep 21 (spam filter's 3-second check had no load time). Fixed with `window._formLoadTime` on every form page (497967b).
- Oct 19: book follow-up drip cut to 2 emails, day 14 and day 21, for signups after the cutover (01dd84a). Covered by the T10 approval per RJ, Oct 22.
- Oct 19-22: "take" removed from 12 live pages (fd3fbc0); team photos (9619e85); RJ's Oct 28 article live, gated (964907a).
- Oct 22: conversion tag verified firing on books-thank-you.html (Ads conversion request returns 200). Form submits also fire from nav.js.
- Oct 22-23: T16 = 4 podcast articles on branch `podcast-batch-oct22`, NOT merged until approved: deciding-to-exit-your-business (Ep.22, Scott Snider), your-money-story (Ep.95), planning-your-retirement (Ep.156), raising-financially-savvy-kids (Ep.158). On publish, add blog.html cards + sitemap entries.
- PDF packets: headless Chrome prints blank sections because `.r` reveal elements start at opacity 0, and the fixed nav overlaps text. Inject `.r{opacity:1!important;transform:none!important}` and `nav{position:absolute!important}` before `--print-to-pdf`.
- Unmerged branches waiting on approval: podcast-count-fix (T5), exit-calculator + niche-calculators (T6), content-expansion-sep10 (T8, needs "take" fixes), rj-reeling-it-in (T2), team-bios (Dori), podcast-batch-oct22 (T16).

## Microsoft Clarity (Oct 26, 2026)
- Project id `z3uvmtk1b8` (Matt's Clarity account). Strict masking (all text masked).
- Tag is on every page (Matt, Oct 26: contact and books are the pages that matter). Every `<form>` carries `data-clarity-mask="True"`.
- New pages: add the Clarity snippet before `</head>` and the mask attribute on any form.

## Session Log: Oct 26, 2026
- Full check: site + all 49 sitemap URLs 200; no new leads since Oct 21; Kestra backlog (RJ called, approvals coming).
- Ads diagnosis (Sep 1-Oct 26): valuation page 177 clicks / $1,293 / 0 conversions (DIY "how to value a business" searches); Exit Planning 4 conv in Sep, 0 in Oct; all campaigns on Maximize Clicks. 5 ad conversions Sep 21-Oct 9 were lost to the form spam-check bug fixed Oct 19.
- Tests live: 26 phrase negatives on both non-brand campaigns; valuation ad now points to exit-planning.html (`~/scripts/decidedly/ads_oct26_tests.py`). Compare on Nov 2.
- Microsoft Clarity live on every page (see section above). RJ notified (cc Wyatt).
- Fixed: Vercel GOOGLE_ADS_* env values refreshed from `~/google-ads.yaml` and prod redeployed; /api/ads-data returns data and the Monday ads email test arrived. Whenever `~/google-ads.yaml` is re-authed, update these four Vercel env values too (`vercel env rm/add NAME production`), then `vercel redeploy <current prod url> --target production`.
- Next page test: valuation landing page built around the calculator (needs Kestra, T6 or new ticket).

## Oct 27, 2026
- Compliance tracker synced from RJ's Kestra review screen: both tabs carry each ticket's Kestra tracking number (Queue column Q; card view status line). T1 and T2 approved, T17 submitted. Kestra disapproved the first December outreach version on Oct 23; the resubmission is pending.
- T2 (Significance Over Success) publish prep is on branch `rj-reeling-it-in`: current nav/footer, canonical + schema, Clarity, Insights card, sitemap. Article text matches the approved version except one quote reworded to drop "take". Merge only after RJ OKs that change. It publishes ungated, as submitted.
- T1 (RJ clips): the six Postiz drafts have past dates. New schedule proposed to RJ (Oct 29 to Nov 16, 8am CT). After Nov 1, 8am CT = 14:00 UTC.
- Google Ads API no longer needs a developer token (verified Oct 27: calls succeed without it). Required: OAuth client ID, client secret, refresh token, and login-customer-id 8793593741 for this account.

### Oct 27 night: publish status
- LIVE: T2 (def4aae), T5 podcast count (7f0078f, 13 pages verified).
- T1 clips scheduled in Postiz (Nov 2, 5, 9, 12, 16, 8am CT). Write-up post held: caption never submitted.
- T6 `niche-calculators` (d55e8b4) and T8 `t8-podcast-blogs` (729b2bb) ready, NOT merged: waiting RJ OK on post-approval wording changes (emailed Oct 27).
- T8 left out 3 posts whose approved PDFs were truncated (headless Chrome prints `.r` reveal sections blank). They need full-text resubmission.
- `exit-planning.html` still says "750+ Episodes" twice; needs a submission.
- Dash checks: scan for `&mdash;`/`&ndash;` entities too, not only the characters.

### Oct 28: T6 + T8 LIVE, NCE link fixed
- Merged to main: T6 calculators + dentist/HVAC pages (niche-calculators), T8 five podcast posts (t8-podcast-blogs), sitemap conflict resolved (60 URLs). Live and verified 200, no noindex, Clarity on.
- T8 gates: RJ's approval says post website articles "as the gated version, the same copy I sent you." Gates restored on creating-a-family-business-legacy and purposeful-philanthropy-meaningful-impact exactly as submitted (box mid-article, text continues below), plus honeypot/_t/Clarity mask.
- client-portal.html: National Charitable link now https://natcharitable.fcsuite.com/erp/portal (NCE's own Donor Portal link); was a Blackbaud sign-in to nationalcharitable.donorcentral.com.
- RJ rule: small post-approval wording changes unrelated to investments don't need his sign-off. Emails to RJ: state the exact ask in the first line.

## Nov 3-4, 2026
### Publishing rule (RJ, Nov 4 call): replaces "merge on APPROVED"
- When RJ sends an article, publish it on the site **gated**, assuming it will be approved. Send him the link.
- If Kestra disapproves, pull the page.
- RJ never posts to LinkedIn before approval.
- RJ is sending 3 more articles by Fri Nov 6.

### Shipped
- Bios merge (1bc1c7a), live.
- T17 `business-worth.html` (177607f). This is the ad landing page (Kestra ACR 9202353) and stays noindex. Google Ads ad 819904328818 (Business Succession > Business Valuation) was repointed there with `~/scripts/decidedly/ads_nov4_t17.py`; it is back in review.
- Nov 11 article `blog/what-your-money-is-for.html` (2bb5542/dc00a5c). Gated after "Your money is a tool"; blog.html card + sitemap entry added. Text matched word for word to RJ's PDF. Watch for Kestra's verdict.
- T18 (election article): RJ withdrew it Nov 4. Not publishing.
- T16: RJ submitted it Nov 4. Publish on approval (blog.html card + sitemap).
- Sanger December posts (T12): 12 queued in Postiz for Dec 3-31, Tue/Wed/Thu at 9am CT (ledger `~/scripts/podcast-clips/sanger-month3/postiz/ledger.json`).

### Weekly sync report
- `~/Projects/decidedly-staging/reports/rj-sync-nov4.html` ("Weekly Sync · Nov 4"). Written for the whole team: refer to RJ by name, never "you".
- The Sanger podcast is NOT active. Never propose an episode.

### Compliance tracker sheet
- `1asPiKY3FEPyS6MY5z6zPJsMawca9vhKb5JuCb9ZwtaY`, with tabs "Submit (card view)" and "Queue".
- RJ wants approved items moved off Queue (to a separate tab).
- RJ uses a personal Google account. Link sharing is temporarily set to anyone-with-link editor; set it back to reader once he is shared directly.
- Nov 4 the whole Workspace org went read-only from over-quota storage, which made Sheets writes return 403. Storage was cleared the same day.

### Approval checks
- Search Gmail for "APPROVED:" subjects on every check. The T17/T12/T14 approvals (Oct 28-29) were missed for a week.

## Nov 5, 2026

### Shipped to main
- 4a7efe3: Clarity dead-click fix. Home team cards link to who-we-are.html#<name>; bio-photo hover zoom removed. Visible text unchanged.
- b6563f4: LinkedIn Insight Tag (partner 10344852) before the last `</body>` on 62 pages, calculators included. NOT on client-portal.html, the Google verification file, or ops/dashboard.html. New pages get the tag too.

### Staged, not merged
- Branch `t16-live` (b67570a): T16 blog batch 2 (4 articles). On APPROVED, merge it, set the sitemap lastmod to the real date, and verify live.

### Retargeting
- Google Ads 8793593741:
  - All visitors 9448258782 and All Converters 9447250886 are attached in observation to the 3 search campaigns.
  - Display campaign 24429877569 "DWM | Retargeting | Display" is PAUSED: $10/day, books offer to books.html with utm_medium=display. It excludes converters and "Client portal visitors" 9501039631.
  - Script: `~/scripts/decidedly/ads_nov5_display_retargeting.py`.
  - Enable only after Sanger approves the budget and Kestra approves the creative (T20).
- LinkedIn ad account 511329742:
  - Matt is Account Manager. Amplified Advisors is set to Viewer.
  - The account is on hold until a payment method is added.
  - Audiences: site visitors (180d) and company page visitors (365d).

### Deploys
- Vercel git deploys can lag about 15 min. Wait; a manual `vercel deploy --prod` isn't needed.

### Compliance T20 (retargeting ads)
- Drive packet 1d5cx3YJJdRqxsyNKuhl8ciX10QqTjerH: the ad preview PDF plus the images.
- Tracker: Queue row and card view T20.
- RJ asked to submit (email thread 1a1ad6be27b882d2).
- On APPROVED, Sanger's budget OK is still needed. Then enable Google display campaign 24429877569 and build the LinkedIn campaign (needs a payment method and 300+ in the audience).

### T21 claymation video (Nov 5)
- RJ's Oct 28 article as a 75s clay animation. The narration and captions are the approved text word for word.
- Drive: folder 1hsZNlBpb33tmib8teNKO9iZNV1oq1CR1. Tracker: Queue row and card view rows.
- Sent to RJ cc Wyatt and Sanger for review (thread 1a1adb4550b3f9ab).
- Pipeline: `~/scripts/decidedly/video-pilot/`. A repeatable series from the weekly articles for the company page and RJ's profile.

## Nov 6, 2026
- Kestra APPROVED: T19 Nov 11 article (9219509), T20 retargeting ads (9223993), T16 blog batch 2 (9220548). Tracker rows moved to "Approved & Closed".
- T16 LIVE: main 8254463 = merge of t16-live onto main, plus the LinkedIn Insight Tag on the 4 new articles (t16-live predated the tag) and sitemap lastmod 2026-11-06. Live files verified identical. Any branch cut before b6563f4 needs the Insight Tag added before merge.
- Google display retargeting 24429877569 ENABLED ($10/day, serving, learning). Script `~/scripts/decidedly/ads_nov6_enable_retargeting.py`. Sanger trusts Matt's judgment on modest spend: no budget asks.
- LinkedIn campaign waits on Sanger's card on ad account 511329742 (asked, thread 1a1b2c7fcdd94458) and a website audience of 300+.
- T21 claymation video on Hold: RJ may tweak the script and record his own voice. Wyatt and Sanger prefer the AI voice. An ElevenLabs clone of RJ's voice has to be made on RJ's own account and shared to Matt's via a private link.

## Session Log: Nov 11, 2026 (lead capture + follow-up)

### Shipped (b167c7a)
- `api/exit-calculator.js` now appends every calculator lead to the leads sheet (DWM_BOOK_SHEET_ID, Sheet1). The source goes in column E as `exit-calculator` or `exit-calculator-<industry>`, and the phone goes in col J. Before this, calculator leads went only to the alert email and Levitate. `book-drip.js` still mails only `books-page` / `blog-popup` rows.
- Google Ads "Book Download" conversion (AW-18360721058/Qbj3CLbbqN8cEKK9ibNE): removed `trackBookDownloads()` from `conversion-tracking.js`. It used to fire on any click of a books link. Real requests now count only on `books-thank-you.html` (inline tag) and after a successful blog popup submit (`blog.html`, `r.ok`). The Nov 4 "book lead" in the weekly email was one of those clicks.

### Lead follow-up (lives outside this repo)
- `~/scripts/decidedly/lead-followup/run.py` runs every 30 min via launchd `com.stormbreaker.dw-lead-followup`.
  - It reads the leads sheet and finds each lead's LinkedIn (Deepline waterfall plus a name check).
  - It enrolls found leads in Reply.io seq 1817051, which sends an RJ connect request with no note, then waits 21 days for an accept. If they accept, RJ views their profile.
  - When a lead accepts, it emails RJ, cc Wyatt and Sanger.
  - It writes sheet columns K-M (LinkedIn / lookup / RJ LinkedIn).
- `check.py` runs hourly inside `~/scripts/connection-health.py` and Telegrams on failure. It also flags any lead alert email with no sheet row, which catches a form here that stops writing to the sheet.
- T25 (Kestra, submitted by RJ): the post-accept LinkedIn message plus 4-email drips for calculator and contact leads. On approval, build the drip here the way `book-drip.js` works.
- Memory: systems/dw-lead-followup.md.

## Nov 12, 2026 (analytics, competitor research, ad experiment, T28)
- Calculator conversion: `exit-planning-calculator.html` sets `window.CALC_CONVERSION = 'AW-18360721058/VIXrCPbuy6odEKK9ibNE'` before `exit-calculator.js` (e2045e6), so calculator leads count as the Value Calculator Lead conversion.
- Google Ads experiment 10062055211 "Exit Planning LP test: page vs calculator (Nov 2026)", Nov 12 to Dec 24, 50/50. Treatment sends Exit Planning ads to `/exit-planning-calculator.html`. Campaign 24108492197 moved to its own $35/day budget (experiments can't use a shared budget). Scripts: `~/scripts/decidedly/ads-experiments/`. Read results on booked calls Dec 24.
- Branch `t28-readiness` (4de875b, pushed, NOT merged): four personal readiness questions + four pillar bars in the calculator results, a results email to the owner from sanger@ (`sendReport` in `api/exit-calculator.js`), a second hero button on exit-planning.html and business-valuation.html, two home-page links to the Fort Worth pages. Sent to RJ for Kestra Nov 12 (one combined PDF, packet in `~/scripts/decidedly/t28-readiness/`). Merge ONLY after Kestra APPROVED and after the Dec 24 experiment ends.
- Monthly competitor scoreboard: `~/scripts/decidedly/scoreboard/` (launchd com.stormbreaker.dw-scoreboard, 1st of month 8:15). Baseline Nov 2026: #1 "exit planning advisor fort worth", #5 "business exit planning dallas"; Google reviews DW 22 vs Strittmatter 158.
- Nov 13: 11/18 Weekly Decision "Four Tax Decisions That Can't Wait" Kestra APPROVED (ACR 9229747) and published (merge of wd-nov18, 5c6cb9e). Live page verified identical to main.
