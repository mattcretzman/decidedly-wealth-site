# Exit Calculator: Sources for Valuation Multiples

Prepared September 30, 2026 for compliance review (Dori Stone, Kestra). Applies to `exit-calculator.js` on branch `exit-calculator`. Not yet approved.

## How the calculator uses these numbers

The owner enters one figure: annual profit before owner pay, interest, taxes and depreciation. The calculator picks a size band from that figure, multiplies the band's low and high multiples by an industry factor, then uses the readiness score (0 to 100) to place the company inside that range. The displayed value is plus or minus 10% around that point.

## Size bands

| Profit input | Low | High | Metric the band is based on | Source figures used | Sources |
|---|---|---|---|---|---|
| Under $250K | 2.0x | 2.8x | SDE | Median 2.0x SDE for deals under $500K; 2.8x SDE for $500K to $1M | IBBA/M&A Source Market Pulse, Q3 2025, Q4 2025 (full-year 2025 chart), Q1 2026 |
| $250K to $750K | 2.5x | 3.3x | SDE | Median 2.8x SDE ($500K to $1M price); 3.0x to 3.3x SDE ($1M to $2M price) | IBBA/M&A Source Market Pulse, 2025 to Q1 2026 |
| $750K to $2M | 3.0x | 4.0x | Blend of SDE and EBITDA | Median 3.0x to 3.3x SDE ($1M to $2M price); 3.5x to 4.1x EBITDA ($2M to $5M price) | IBBA/M&A Source Market Pulse, 2025 to Q1 2026 |
| $2M to $5M | 4.0x | 5.5x | EBITDA | Median 4.5x to 5.8x EBITDA ($5M to $50M price); about 4x to 5x EBITDA for smaller companies; GF Data average 6.4x ($3M to $5M EBITDA, PE deals) | IBBA Market Pulse 2025 to Q2 2026; Pepperdine PCMR 2026 (summary); GF Data Q3 2025 |
| $5M to $10M | 5.0x | 7.0x | EBITDA | Median 5.3x to 5.8x EBITDA ($5M to $50M price); GF Data average 6.8x to 7.4x ($5M to $8M EBITDA), 6.8x to 7.0x ($8M to $10M) | IBBA Market Pulse; GF Data Q3 2025 |
| $10M and up | 6.5x | 8.0x | EBITDA | GF Data average 7.4x long run, 8.3x 2025 YTD (over $10M EBITDA); Pepperdine median about 7x to 8.5x above $10M EBITDA | GF Data Q3 2025; Pepperdine PCMR 2026 (summary) |

Previous placeholder bands for comparison: under $500K 2.5x to 3.5x, $500K to $1M 3.0x to 4.5x, $1M to $3M 4.0x to 5.5x, $3M to $10M 5.0x to 7.0x, $10M+ 6.0x to 8.5x. The placeholders overstated value most for the smallest businesses.

### Note on SDE vs EBITDA with a single input

Small businesses are priced on Seller's Discretionary Earnings (SDE), which includes the owner's pay. Larger businesses are priced on EBITDA, which deducts a market salary for management. Our input ("profit before owner pay") matches SDE. The two bands under $750K therefore use SDE multiples directly. The $750K to $2M band sits between the SDE and EBITDA figures because, at that size, applying a pure EBITDA multiple to a number that still includes owner pay would overstate value. Above $2M, owner pay is a small share of profit and EBITDA multiples are used, set at or below source midpoints.

Also note that IBBA bands are defined by deal price, not by profit. We converted them to profit ranges by dividing the price boundaries by the median multiple (for example, a $1M to $2M price at about 3x SDE corresponds to roughly $330K to $670K of SDE).

## Industry factors

Method: BVR DealStats Value Index, Q1 2025 edition (data through 2024), Exhibit 9 (median selling price / SDE) and Exhibit 10 (median selling price / EBITDA) by NAICS sector, private targets. For each sector, factor = sector median divided by all-sector median, averaged over 2022 to 2024 (all-sector: SDE 2.2x, EBITDA 3.6x). SDE and EBITDA ratios were averaged, cross-checked against GF Data (TEV / adjusted EBITDA by industry, $10M to $250M deals) and BizBuySell, rounded to 0.05, and pulled toward 1.00 where year-to-year data swings or sample sizes are thin.

| Industry | Old | New | DealStats NAICS | EBITDA ratio | SDE ratio | Cross-check | Notes |
|---|---|---|---|---|---|---|---|
| Construction and trades | 0.85 | 1.00 | 23 | 0.98 (3.5x) | 1.06 (2.3x) | IBBA: construction was the top lower middle market sector in 2025 | Data does not support a discount |
| Distribution and wholesale | 0.95 | 1.05 | 42 | 1.14 (4.1x) | 1.29 (2.8x) | GF Data distribution 0.99 | Trend declining in 2024, rounded down |
| Financial and insurance services | 1.10 | 1.10 | 52 | 1.32 (4.8x) | 1.17 (2.6x) | none | Volatile year to year; held at old value |
| Healthcare services | 1.15 | 1.05 | 62 | 0.97 (3.5x) | 1.03 (2.3x) | GF Data healthcare services 1.12 to 1.16 | Premium shows mainly in PE-size deals |
| Manufacturing | 1.00 | 1.05 | 31-33 | 1.17 (4.2x) | 1.15 (2.5x) | GF Data manufacturing 0.92 to 0.93 | Sources disagree; small positive factor |
| Oil, gas and energy services | 0.85 | 1.00 | 21 | not reported | not reported | none | Too few deals for annual medians. No data-based adjustment. Compliance may prefer a discount given cyclicality |
| Professional services | 0.95 | 1.05 | 54 | 1.06 (3.8x) | 1.05 (2.3x) | GF Data business services 1.01 to 1.03 | Consistent across sources |
| Real estate services | 0.95 | 1.00 | 53 | 1.08 (3.9x) | 1.08 (2.4x) | none | Driven by a single year (2024: 5.2x). NAICS 53 includes rental and leasing |
| Restaurants and hospitality | 0.75 | 0.80 | 72 | 0.70 (2.5x) | 0.83 (1.8x) | BizBuySell restaurants 2.31x (Q3 2025) vs 2.61x all (2025), about 0.89 | Lowest sector in every source |
| Retail | 0.80 | 0.95 | 44-45 | 0.93 (3.3x) | 1.06 (2.3x) | GF Data retail 1.04; BizBuySell retail about 1.00 | Rounded down |
| Technology and software | 1.25 | 1.25 | 51 | 1.87 (6.7x) | 1.23 (2.7x) | GF Data technology 0.92 (2025) to 1.25 (long run) | Held at the SDE ratio; EBITDA ratio not used as it reflects a few high-multiple deals |
| Transportation and logistics | 0.90 | 1.00 | 48-49 | 1.01 (3.6x) | 1.06 (2.3x) | none | |
| Other | 1.00 | 1.00 | all | 1.00 | 1.00 | | Market-wide bands |

## Source list

| Source | Edition / year | Metric | Statistic | URL |
|---|---|---|---|---|
| IBBA and M&A Source Market Pulse | Q3 2025 highlights; Q4 2025 report (full-year 2025 chart); Q1 2026 executive summary; Q2 2026 press release | SDE multiple (under $2M price), EBITDA multiple ($2M to $50M price) | Median (Q4 2025 chart is labeled average) | https://www.ibba.org/wp-content/uploads/2025/11/market-pulse-highlights-q3-2025.pdf ; https://www.garlandchamber.com/wp-content/uploads/2026/02/Market-Pulse-Q4-2025-Report.pdf ; https://wabusinessbrokers.com/wp-content/uploads/2026/05/Q1-2026-IBBA-Market-Pulse-Report-Exec-Summary-compressed-with-logo.pdf ; http://www.prnewswire.com/news-releases/the-market-pulse-survey-q2-2026-reports-the-latest-trends-in-business-sales-up-to-50m-302858664.html |
| GF Data (an ACG company), Middle-Market M&A ESOP Advisor Special Report | Q3 2025 (published 2026) | TEV / TTM adjusted EBITDA, PE-backed deals $10M to $500M TEV | Average | https://gfdata.com/wp-content/uploads/Q3-25_GFData_ESOP_Report.pdf |
| GF Data Highlights and Products | April 2025 (data through 2024) | TEV / adjusted EBITDA by TEV | Average | https://middlemarketgrowth.org/wp-content/uploads/2025/04/GF-Data-4th-Quarter-Highlights-and-Products.pdf |
| BVR DealStats Value Index | Q1 2025 edition (data 2015 to 2024) | MVIC / SDE and MVIC / EBITDA by NAICS sector, private targets | Median | https://www.bvresources.com/docs/default-source/free-downloads/dvi.pdf |
| Pepperdine Private Capital Markets Report | 2026 | EBITDA multiples by company size | Median | https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/ (primary PDF blocked to automated access; figures taken from https://chinookadvisors.com/news/key-takeaways-from-the-2026-pepperdine-private-capital-markets-report/ ) |
| BizBuySell Insight Report | 2025 full year; Q3 2025 | Cash flow (SDE) multiple of reported sales | Average | https://www.bizbuysell.com/blog/2025-year-in-review/ ; https://www.bizbuysell.com/insight-report/ |

## For compliance: methodology and limitations

The calculator's value ranges come from published surveys and databases of completed private business sales, not from Decidedly's own opinion of any company. Size is the main driver: every source shows that smaller companies sell for lower multiples of profit. For businesses earning under about $750K, we used median multiples of Seller's Discretionary Earnings reported by business brokers (IBBA and M&A Source Market Pulse, 2025 through mid-2026). For larger businesses we used EBITDA multiples from the same survey, from GF Data (private equity deals) and from the Pepperdine Private Capital Markets Report, setting our ranges at or below the reported midpoints because private equity averages skew toward above-average companies. Industry adjustments come from BVR DealStats sector medians for 2022 to 2024 and are modest (0.80 to 1.25), because the data shows size matters far more than industry for private companies.

Limitations: (1) These are broad market ranges and are not an appraisal or a fairness opinion; actual prices depend on deal terms, buyer type, working capital, debt, and diligence findings. (2) Sources mix medians and averages and use different earnings definitions (SDE vs adjusted EBITDA); a single profit input cannot fully reconcile them. (3) IBBA bands are defined by sale price and had to be converted to profit ranges. (4) Industry data is thin for oil, gas and energy services, and volatile for financial services, real estate and technology; those factors were held at or near 1.00 or at the previous value. (5) The Pepperdine and BizBuySell figures were taken from published summaries because the primary documents blocked automated access; they should be spot-checked against the original reports before launch. (6) Multiples change over time; values should be refreshed at least annually. Page copy should state that results are estimates for education only and not a valuation.
