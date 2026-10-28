# Industry Exit Calculators (HVAC and Dental): Sources for Valuation Multiples

Prepared October 3, 2026 for compliance review (Dori Stone, Kestra). Applies to `exit-calculator.js` (the `hvac` and `dental` configs) on branch `niche-calculators`. Not yet approved. The generic calculator is documented separately in `ops/calculator-multiples-sources.md` and its numbers are unchanged.

Pages covered:
- `hvac-business-exit-calculator.html`
- `dental-practice-exit-calculator.html`
- `wealth-management-for-hvac-business-owners.html`
- `wealth-management-for-dentists.html`

All four carry `noindex`, are not in the nav and are not in the sitemap.

## How the calculator uses these numbers

The method is the same as the generic calculator:

1. The owner enters one figure: annual profit before their own pay, interest, taxes and depreciation. For dental, this means before the owner-dentist's own pay.
2. The calculator picks a size band from that figure.
3. It multiplies the band's low and high multiples by a segment factor. For HVAC, the segment is the type of work. For dental, the segment is the practice type, and every factor is 1.00.
4. The readiness score (0 to 100) places the business inside that range.
5. The displayed value is plus or minus 10% around that point.

The after-tax figure uses 23.8% (20% federal long-term capital gains plus 3.8% net investment income tax). Texas is the default, with no state income tax. Choosing "Another state" adds a flat 5%.

If the owner enters revenue (called "collections" for dental), the results also show a revenue cross-check. This is BizBuySell's lower-to-upper quartile revenue multiple for that industry. It is shown as a comparison only and does not change the estimate.

## Important: single profit input vs SDE and EBITDA

Small businesses are priced on Seller's Discretionary Earnings (SDE), which includes the owner's pay. Larger businesses and private equity buyers price on EBITDA. EBITDA is calculated after replacing the owner's pay with a market wage.

Our input matches SDE. So we use published EBITDA multiples only for the larger bands, and we set those bands well below the published EBITDA figures.

This matters most for dental. Most of an owner-dentist's "profit before own pay" is really pay for clinical work. Buyers deduct a market dentist wage before they apply an EBITDA multiple. Applying a DSO EBITDA multiple to our input would overstate value a lot, so the dental bands stay close to SDE-based private sale data until profit is large.

## HVAC

### Size bands

| Profit input | Low | High | Basis | Source figures |
|---|---|---|---|---|
| Under $500K | 2.0x | 2.8x | SDE | BizBuySell HVAC sold comps 2021 to 2025: lower quartile 1.99x, median 2.58x, average 2.75x. IBBA Market Pulse (all industries): 2.0x SDE under $500K price |
| $500K to $1M | 2.5x | 3.5x | SDE | BizBuySell HVAC median 2.58x, upper quartile 3.33x. IBBA: 2.8x ($500K to $1M price) to 3.0x to 3.3x ($1M to $2M) |
| $1M to $2M | 3.25x | 4.75x | Blend of SDE and EBITDA | IBBA: 3.3x SDE ($1M to $2M price), 4.0x EBITDA ($2M to $5M price). First Page Sage HVAC EBITDA $1M to $5M (7.4x to 9.2x) used as a ceiling only |
| $2M to $5M | 4.5x | 6.5x | EBITDA | GF Data (all industries, PE deals) $3M to $5M EBITDA: 6.4x long-run average, 6.7x in 2025. First Page Sage HVAC $1M to $5M: 7.4x to 9.2x |
| $5M to $10M | 6.0x | 8.0x | EBITDA | GF Data $5M to $10M: 6.8x to 7.4x. First Page Sage HVAC $5M to $10M: 8.4x to 10.8x |
| $10M and up | 7.0x | 9.0x | EBITDA | GF Data over $10M: 7.4x long run, 8.3x in 2025. **No HVAC-specific primary figure verified for this size.** Practitioner articles cite 10x and up for platform-scale deals; we did not use them |

### Type-of-work factors

| Segment | Factor | Basis |
|---|---|---|
| Residential service and replacement | 1.00 | Reference |
| Commercial service and maintenance | 0.95 | First Page Sage shows residential all-purpose at 9.2x vs commercial at 7.4x to 8.0x ($1M to $5M EBITDA). We used a much smaller gap because this is one firm's data |
| Mix of service and new construction | 0.90 | Practitioner valuation guides describe builder-heavy shops trading 1 to 2 turns lower. These are secondary sources, not a primary dataset. Factor deliberately modest |
| Mostly new construction installs | 0.80 | Same as above |

### HVAC readiness questions (weights total 100)

| Question | Weight | Answers (points) | Why it is included |
|---|---|---|---|
| Share of revenue from customers on maintenance agreements | 20 | 30% or more (1), 10% to 30% (0.5), under 10% (0) | Practitioner sources consistently cite a premium for recurring agreement revenue, often framed at 30% or more of revenue. The thresholds are judgment-based |
| Anyone besides the owner licensed to serve as the company's Texas air conditioning contractor of record | 15 | Yes / Somewhat / No | Texas HVAC companies operate under a TDLR air conditioning and refrigeration contractor license. A single license holder is a transfer issue |
| Most technicians with the company two years or more | 15 | Most / About half / Few | Technician retention and depth |
| Owner still running service calls or selling replacements most weeks | 15 | No is good | Owner dependence (BizBuySell lists full-time owner involvement as a lower-quartile trait) |
| More than 20% of revenue from new-construction builders or GCs | 10 | No is good | Concentration and cyclicality |
| Trucks and equipment in good shape, no big replacement bill in two years | 10 | Yes / Somewhat / No | Deferred capital expenditure |
| Financials reviewed or audited by a CPA, with trusted job costing | 15 | Yes / Somewhat / No | Diligence readiness |

### Revenue cross-check (shown, not used in the estimate)

BizBuySell HVAC sold comps, 2021 to 2025: revenue multiple lower quartile 0.38x, median 0.56x, upper quartile 0.74x. The page shows 38% to 74% of revenue.

### Texas market context used on the landing page

The landing page says: "private-equity-backed platforms have been buying residential and commercial HVAC companies across the country. Some of the largest are based in Dallas-Fort Worth, and they have bought companies here." Support:

- Apex Service Partners (backed by Alpine Investors, with a minority investment from Apollo Funds) is headquartered in Dallas. Sources: Business Wire, May 28, 2026, https://www.businesswire.com/news/home/20260528216487/en/ , and Dallas Innovates, https://dallasinnovates.com/dallas-based-apex-service-partners-gets-minority-investment-from-apollo-funds/
- Wrench Group (Leonard Green and Partners) acquired Baker Brothers Plumbing and Air Conditioning of Dallas-Fort Worth. Source: PR Newswire, Feb 2017.

The page names no firm. Practitioner blogs report figures such as "PE add-ons up 88% in 2025". We did not use them because we could not trace them to a primary report.

## Dental

### Size bands

| Profit input (before owner-dentist pay) | Low | High | Basis | Source figures |
|---|---|---|---|---|
| Under $500K | 1.5x | 2.4x | SDE | Peak Business Valuation: 1.0x to 2.0x SDE. BizBuySell dental sold comps 2021 to 2025: lower quartile 1.60x, median 2.48x |
| $500K to $1M | 1.9x | 2.75x | SDE | BizBuySell median 2.48x, upper quartile 3.37x. Kept below the upper quartile |
| $1M to $2M | 2.5x | 4.0x | SDE, moving toward EBITDA | Multi-doctor practices. BizBuySell upper quartile 3.37x. FOCUS: under $1M EBITDA 5x to 7x, but that is EBITDA after a market dentist wage, so it is much smaller than our input |
| $2M to $5M | 4.5x | 6.5x | EBITDA, discounted | FOCUS: $1M to $3M EBITDA 7x to 9x (regional DSO add-ons). Discounted for owner pay in our input |
| $5M and up | 6.0x | 8.5x | EBITDA, discounted | FOCUS: $3M to $5M EBITDA 9x to 11x; general dentistry platforms 9x to 12x. Discounted |

### Practice type

Every type (general, orthodontics, pediatric, oral surgery, endodontics, periodontics, other) uses a factor of 1.00. Secondary sources say specialty practices sell at a premium, often quoted at 80% to 100% of collections against 65% to 85% for general practices. We could not verify this against a primary dataset, so we made no adjustment. The type is collected for the advisor's information only.

### Dental readiness questions (weights total 100)

| Question | Weight | Answers (points) | Why it is included |
|---|---|---|---|
| Associate dentist in place who would stay after a sale | 20 | Yes / Somewhat / No | FOCUS (2026): provider risk is a primary decision driver and a top reason DSOs walked away from deals in 2025 |
| Share of dentist production done personally by the owner | 15 | Under 50% (1), 50% to 75% (0.5), over 75% (0) | Owner-provider concentration (FOCUS). The thresholds are judgment-based |
| Share of total production from hygiene | 15 | 30% or more (1), 20% to 30% (0.5), under 20% (0) | FOCUS calls hygiene "the backbone of recurring dental EBITDA". Practitioner sources cite 30% or more as strong. The thresholds are judgment-based |
| Share of collections from PPO plans at contracted fees | 15 | Under 40% (1), 40% to 70% (0.5), over 70% (0) | FOCUS: payer mix is underwritten more conservatively in 2026, and heavily discounted plans lower EBITDA quality. The thresholds are judgment-based |
| Office lease with 10 or more years left, counting renewals | 15 | Yes / Somewhat / No | Buyer and lender financing term. This is common practice guidance, not a sourced statistic |
| Collections grew over the last three years | 10 | Yes / Somewhat / No | Growth trend |
| Financials prepared by a CPA, with clean production and collections reports | 10 | Yes / Somewhat / No | Diligence readiness |

### Revenue cross-check (shown, not used in the estimate)

BizBuySell dental sold comps, 2021 to 2025: revenue multiple lower quartile 0.51x, median 0.70x, upper quartile 0.86x. The page shows 51% to 86% of collections. BizBuySell's figures include specialty practices.

### Texas market context used on the landing page

The landing page says: "one of the largest DSOs in the country is headquartered in North Texas." Support: MB2 Dental is headquartered in Carrollton, TX, and reports more than 800 partner practices (Group Dentistry Now DSO Deal Roundup, Sept 2025, https://www.groupdentistrynow.com/dso-group-blog/dso-deals-september-2025/ ). The page does not name MB2.

## Source list

| Source | Edition / date | What we used | URL |
|---|---|---|---|
| BizBuySell, HVAC Business Valuation Benchmarks | Sold comps 2021 to 2025; page viewed Oct 3, 2026 | SDE and revenue multiple quartiles; 2025 median sale price $800K | https://www.bizbuysell.com/learning-center/valuation-benchmarks/hvac/ |
| BizBuySell, Dental Practice Valuation Benchmarks | Sold comps 2021 to 2025; page viewed Oct 3, 2026 | SDE and revenue multiple quartiles; notes larger practices selling to private equity in 2025 | https://www.bizbuysell.com/learning-center/valuation-benchmarks/dental-practice/ |
| First Page Sage, HVAC EBITDA and Valuation Multiples | Published Feb 6, 2025; data Q3 2022 to Q1 2025 | HVAC EBITDA by size and segment (upper reference only) | https://firstpagesage.com/business/hvac-ebitda-valuation-multiples/ |
| FOCUS Investment Banking, Dental Practice EBITDA Multiples 2026 | Apr 27, 2026 | General dentistry add-on 5x to 8x and platform 9x to 12x; EBITDA size tiers; buyer criteria | https://focusib.com/insights/article/dental-practice-ebitda/ |
| Peak Business Valuation, Dental Practice Valuation Multiples | Undated | 1.0x to 2.0x SDE, 1.8x to 2.7x EBITDA, 0.46x to 0.67x revenue | https://www.peakbusinessvaluation.com/dental-practice-valuation-multiples/ |
| IBBA and M&A Source Market Pulse | 2025 to Q2 2026 | Cross-industry SDE and EBITDA medians by deal size | See ops/calculator-multiples-sources.md |
| GF Data (ACG) | Q3 2025 | Cross-industry PE TEV / EBITDA by EBITDA size | See ops/calculator-multiples-sources.md |

## For compliance: methodology and limitations

The ranges come from published data on completed business sales, not from Decidedly's opinion of any company. Size is the main driver in every source.

**HVAC.** Small bands sit on BizBuySell's HVAC-specific quartiles. Larger bands sit between the cross-industry private equity averages (GF Data) and an HVAC-specific advisory firm's figures (First Page Sage). They are deliberately closer to the lower figure.

**Dental.** Bands stay close to SDE-based private sale data (BizBuySell, Peak) until profit is large. Above that, they are set well below the DSO EBITDA figures (FOCUS), because owner-dentist pay inflates our profit input.

Limitations:

1. These are broad market ranges, not an appraisal or fairness opinion.
2. First Page Sage and FOCUS are advisory firms publishing their own aggregated figures. Their methods and sample sizes are not disclosed. We treated them as upper references.
3. BizBuySell data skews toward smaller, broker-listed businesses and mixes specialties for dental.
4. No primary HVAC-specific multiple was verified above $10M EBITDA, and no primary specialty-dental premium was verified. Both are handled conservatively: cross-industry data for the first, no adjustment for the second.
5. Readiness thresholds (such as 30% agreement revenue and 30% hygiene) and segment factors are judgment calls informed by practitioner guidance, not statistical estimates.
6. DSO offers often include equity rollover, earnouts and work-back requirements. A single number cannot capture those.
7. Values should be refreshed at least annually.

## Wording flagged for Dori

- **Calculator headline "What is your HVAC business worth?" and "What is your dental practice worth?"** Matt specified the headline. The page states that Decidedly does not broker sales and that results are estimates, not an appraisal.
- **The generic calculator's Decision Lab copy said "pressure-test the value".** On the industry pages it reads "look at what you would keep after taxes". This avoids implying valuation services.
- **"The sources are listed for our compliance team and available on request".** This appears in the "About this calculator" copy on both calculator pages. Remove it if the firm does not want to field requests.
- **Tax wording.** Texas has no state income tax. The 23.8% federal rate is simplified. The landing pages say "planning with your CPA and attorney" rather than claiming to give tax or legal advice.
- **"plan for it early, while more options are open"** (decision 5 on both landing pages). This is a general statement about estate planning before a sale, not a promise.
- **"one of the largest DSOs in the country is headquartered in North Texas"** and **"Some of the largest [HVAC platforms] are based in Dallas-Fort Worth"**. These are factual and sourced above; no firm is named.
- **The disclaimer on both landing pages** states that Decidedly does not broker sales or provide formal business valuations.

## Update October 3, 2026: added features (also for review)

### Market momentum sections (HVAC and dental landing pages and calculators)

Each stat and example on the page comes from a source listed below. The pages name no buyer in the body text. The source line names the companies because that is where the facts come from.

| Page text | Source |
|---|---|
| HVAC: "The company that calls itself America's largest residential HVAC, plumbing and electrical services business is now headquartered in Dallas, with 75 local brands in 46 states." | Dallas Innovates, May 28, 2026, on Apex Service Partners' minority investment from Apollo Funds (Alpine Investors also invested more). https://dallasinnovates.com/dallas-based-apex-service-partners-gets-minority-investment-from-apollo-funds/ ; Business Wire release of the same date: https://www.businesswire.com/news/home/20260528216487/en/ |
| HVAC: "A national residential HVAC, plumbing and electrical platform bought a North Texas service company founded in 2004. The company kept its name and its leadership." (Jan 2026) | Champions Group Holdings press release, Jan 21, 2026, on its acquisition of Lex Cooling, Heating, Plumbing and Electrical. https://championsgroupholdings.com/2026/01/21/champions-group-expands-texas-footprint-with-acquisition-of-lex-cooling-heating-plumbing-electrical/ |
| HVAC: "A commercial HVAC platform formed by a private equity firm in February 2025 made a Wylie, Texas mechanical contractor its second add-on acquisition." (Jan 2026) | AE Industrial Partners press release, Jan 20, 2026, on United Building Solutions acquiring DFW Mechanical Group. https://www.aeroequity.com/united-building-solutions-acquires-dfw-mechanical-group/ |
| Dental: "73%: Share of U.S. dentists who owned their practice in 2023, down from 85% in 2005." | ADA Health Policy Institute, Practice Ownership Trends in Dentistry: A New Look at Old Data, June 2025. https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/hpi/practice_ownership_trends_dentistry_new_look_old_data.pdf |
| Dental: "27%: Share of dentists less than 10 years out of dental school who were affiliated with a DSO in 2024, up from 24% in 2023." | Same ADA HPI brief, June 2025. Also reported in ADA News, Nov 17, 2025. |
| Dental: "800: Practices one North Texas based DSO had partnered with by late 2025, after adding 47 practices that year alone." | Group Dentistry Now, DSO Deal Roundup, Oct 1, 2025 (MB2 Dental, headquartered in Carrollton, TX). https://www.groupdentistrynow.com/dso-group-blog/dso-deals-september-2025/ |

Each section closes with "Buyers are active. Prepared owners get better options." The section text says the market data "says nothing about what any one company will sell for." The source line reads "Examples of market activity only. Not an endorsement of any buyer and not a prediction about any sale."

We did not use some figures because we could not trace them to a primary report:
- "PE add-ons up 88% in 2025"
- "PE is now more than half of HVAC M&A"
- "about a quarter of Texas dentists are DSO-affiliated"

### Value levers (all three calculators, behind the email gate)

For each readiness question that did not get full marks, the calculator re-runs the same model with only that answer changed to its best option. It reports the change in the midpoint value, rounded to $10K. The section is labeled "Estimate" and explains the method in one line. Levers are sorted by dollar amount, largest first.

These are model outputs, not predictions of what a buyer would pay. They add up, give or take rounding, to the "if this business scored 100" upside figure the calculator already showed.

### "What your exit buys" (all three calculators, behind the email gate)

The math is shown on the page:
- Monthly figure = amount kept after estimated taxes and debt × 4% ÷ 12, rounded to $100.
- The owner's stated after-tax need gets the same math, and the page shows the ratio between the two.

The label reads "Illustration only, not a projection or investment advice. Actual results vary. Assumes a flat 4% drawn each year from the amount you keep, before income taxes, with no growth or inflation." The 4% is a round illustration rate. It is not a recommended withdrawal rate. **Dori: please confirm this wording is acceptable, or give a preferred rate or phrasing.**

### Imagery

All photos are AI-generated (fal.ai, seedream v4) and show no real people or businesses. Faces are turned away or too distant to make out, and there are no logos or captions implying clients. Alt text describes each scene generically. Files are in `images/niche/`.

### Video slot

Each landing page has a commented-out section for a Sanger video. Nothing is embedded until the clip is approved.
