/* Decidedly Wealth: Exit Planning Calculator (short version)
 *
 * One script serves the generic calculator and the industry calculators.
 * A page picks an industry by setting, before this script loads:
 *   <script>window.CALC_INDUSTRY = 'hvac';</script>     (or 'dental')
 * No setting (or an unknown key) = the generic calculator.
 *
 * MODEL NOTE: the multiple ranges below are sourced from published private
 * company transaction data, as of 2026. They are general market ranges, not
 * an appraisal, and they still require compliance review before launch.
 * Generic sources and methodology: ops/calculator-multiples-sources.md
 * HVAC and dental sources and methodology: ops/niche-multiples-sources.md
 */
(function(){
  'use strict';

  /* ---------------------------------------------------------------------
   * GENERIC CONFIG
   * ------------------------------------------------------------------- */

  /* SOURCES FOR SIZE_BANDS (multiple of the single profit input)
   * 1. IBBA and M&A Source Market Pulse, Q1 2025 to Q2 2026: median multiples by
   *    deal price. Under $2M price = multiple of SDE: under $500K 2.0x,
   *    $500K to $1M 2.8x, $1M to $2M 3.0x to 3.3x. $2M to $50M price = multiple
   *    of EBITDA: $2M to $5M 3.5x to 4.1x, $5M to $50M 4.5x to 5.8x.
   * 2. GF Data (ACG), Q3 2025 report: average TEV / adjusted EBITDA for private
   *    equity deals by EBITDA size, 2003 to Q3 2025 average (2025 YTD):
   *    $3M to $5M 6.4x (6.7x), $5M to $8M 6.8x (7.4x), $8M to $10M 7.0x (6.8x),
   *    over $10M 7.4x (8.3x). Averages of PE deals, which skew above typical.
   * 3. Pepperdine Private Capital Markets Report 2026 (via published summary):
   *    median deal multiples about 4x to 5x EBITDA under $1M EBITDA, rising to
   *    7x to 8.5x above $10M EBITDA.
   * Bands 1 and 2 use SDE multiples (profit includes owner pay). Band 3 blends
   * SDE and EBITDA figures. Bands 4 to 6 use EBITDA multiples, set at or below
   * the source midpoints to stay conservative.
   */
  var SIZE_BANDS = [
    { max: 250e3,    lo: 2.0, hi: 2.8 },   // SDE: IBBA under $1M price
    { max: 750e3,    lo: 2.5, hi: 3.3 },   // SDE: IBBA $500K to $2M price
    { max: 2e6,      lo: 3.0, hi: 4.0 },   // SDE to EBITDA: IBBA $1M to $5M price
    { max: 5e6,      lo: 4.0, hi: 5.5 },   // EBITDA: IBBA $5M to $50M, Pepperdine, GF Data $3M to $5M
    { max: 10e6,     lo: 5.0, hi: 7.0 },   // EBITDA: IBBA $5M to $50M, GF Data $5M to $10M
    { max: Infinity, lo: 6.5, hi: 8.0 }    // EBITDA: GF Data over $10M, Pepperdine over $10M
  ];

  /* SOURCES FOR INDUSTRIES (factor applied to the size band)
   * Primary: BVR DealStats Value Index, Q1 2025 edition (data through 2024),
   * Exhibits 9 and 10: median selling price / SDE and selling price / EBITDA by
   * NAICS sector, private targets. Factor = sector median / all-sector median,
   * 2022 to 2024 average, SDE and EBITDA ratios averaged.
   * Cross-check: GF Data Q3 2025, TEV / EBITDA by industry ($10M to $250M TEV),
   * and BizBuySell 2025 cash flow multiples. Rounded to 0.05 and pulled toward
   * 1.00 where the data is volatile or thin.
   */
  var INDUSTRIES = [
    ['Construction and trades', 1.00],            // NAICS 23: EBITDA 0.98, SDE 1.06
    ['Distribution and wholesale', 1.05],         // NAICS 42: EBITDA 1.14, SDE 1.29; GF Data 0.99
    ['Financial and insurance services', 1.10],   // NAICS 52: EBITDA 1.32, SDE 1.17; volatile, held low
    ['Healthcare services', 1.05],                // NAICS 62: EBITDA 0.97, SDE 1.03; GF Data 1.12 to 1.16
    ['Manufacturing', 1.05],                      // NAICS 31-33: EBITDA 1.17, SDE 1.15; GF Data 0.92
    ['Oil, gas and energy services', 1.00],       // NAICS 21: too few annual deals in DealStats; no adjustment
    ['Professional services', 1.05],              // NAICS 54: EBITDA 1.06, SDE 1.05; GF Data 1.01 to 1.03
    ['Real estate services', 1.00],               // NAICS 53: 1.08 driven by one year (2024); held at 1.00
    ['Restaurants and hospitality', 0.80],        // NAICS 72: EBITDA 0.70, SDE 0.83; BizBuySell 0.89
    ['Retail', 0.95],                             // NAICS 44-45: EBITDA 0.93, SDE 1.06; GF Data 1.04
    ['Technology and software', 1.25],            // NAICS 51: EBITDA 1.87, SDE 1.23; GF Data 0.92 to 1.25
    ['Transportation and logistics', 1.00],       // NAICS 48-49: EBITDA 1.01, SDE 1.06
    ['Other', 1.00]
  ];

  // Answer sets. Each option: [label, points]. Points are 1 (no gap), 0.5 or 0.
  var YES_GOOD = [['Yes', 1], ['Somewhat', 0.5], ['No', 0]];
  var NO_GOOD  = [['Yes', 0], ['Somewhat', 0.5], ['No', 1]];

  // Readiness questions: weight, answer set, and the gap message if not full marks
  var QUESTIONS = [
    { id: 'owner',    w: 20, opts: YES_GOOD, q: 'Could the business run for three months without you?',
      gap: 'Owner dependence. If the business needs you every day, buyers see risk and discount the price or tie more of it to an earnout.' },
    { id: 'team',     w: 20, opts: YES_GOOD, q: 'Do you have a leadership team that would stay after a sale?',
      gap: 'Management depth. A team that stays after you leave is one of the biggest things buyers pay for.' },
    { id: 'books',    w: 15, opts: YES_GOOD, q: 'Are your financials reviewed or audited by a CPA?',
      gap: 'Financial records. Clean, reviewed statements shorten due diligence and protect the price you agreed on.' },
    { id: 'conc',     w: 15, opts: NO_GOOD,  q: 'Does any one customer bring in more than 20% of revenue?',
      gap: 'Customer concentration. Losing one big customer after the sale would hurt, so buyers price that risk in.' },
    { id: 'recur',    w: 15, opts: YES_GOOD, q: 'Is a meaningful share of your revenue recurring or under contract?',
      gap: 'Predictable revenue. Recurring or contracted revenue is worth more than revenue you have to win again every year.' },
    { id: 'growth',   w: 15, opts: YES_GOOD, q: 'Has profit grown over the last three years?',
      gap: 'Growth trend. Buyers pay for where the business is going, and a flat or falling trend lowers the multiple.' }
  ];

  /* ---------------------------------------------------------------------
   * INDUSTRY CONFIGS
   * Same shape as the generic config: bands (multiples of the profit input),
   * segments (factor applied to the band, shown in the first dropdown),
   * questions (weights total 100), plus labels used in results and alerts.
   * Full source tables: ops/niche-multiples-sources.md
   * ------------------------------------------------------------------- */
  var CONFIGS = {

    hvac: {
      key: 'hvac',
      noun: 'HVAC business',
      article: 'an',
      /* HVAC_BANDS (multiple of profit before owner pay). Full table: ops/niche-multiples-sources.md
       * 1. BizBuySell HVAC Valuation Benchmarks (sold 2021 to 2025, viewed Oct 2026): SDE multiple
       *    lower quartile 1.99x, median 2.58x, average 2.75x, upper quartile 3.33x; 2025 average 2.68x.
       * 2. IBBA and M&A Source Market Pulse (all industries): 2.0x SDE under $500K price, 2.8x
       *    $500K to $1M, 3.0x to 3.3x $1M to $2M, 4.0x EBITDA $2M to $5M, 4.5x to 5.8x $5M to $50M.
       * 3. First Page Sage, HVAC EBITDA and Valuation Multiples (Feb 6, 2025, data Q3 2022 to Q1 2025):
       *    EBITDA 5.4x to 6.3x ($500K to $1M), 7.4x to 9.2x ($1M to $5M), 8.4x to 10.8x ($5M to $10M).
       *    Used as an upper reference only (single advisory firm, method not disclosed).
       * 4. GF Data Q3 2025 (all industries, PE deals): 6.4x to 6.7x ($3M to $5M EBITDA), 6.8x to 7.4x
       *    ($5M to $10M), 7.4x to 8.3x (over $10M).
       * Small bands sit on the BizBuySell quartiles. Larger bands sit between GF Data (all industries)
       * and First Page Sage (HVAC), well below the HVAC-specific figures because our input still
       * includes owner pay.
       */
      bands: [
        { max: 500e3,    lo: 2.0,  hi: 2.8 },    // SDE: BizBuySell HVAC lower quartile to median+; IBBA under $500K
        { max: 1e6,      lo: 2.5,  hi: 3.5 },    // SDE: BizBuySell HVAC median to upper quartile; IBBA 2.8x to 3.3x
        { max: 2e6,      lo: 3.25, hi: 4.75 },   // SDE to EBITDA blend: IBBA 3.3x SDE / 4.0x EBITDA; FPS $1M to $5M as ceiling
        { max: 5e6,      lo: 4.5,  hi: 6.5 },    // EBITDA: GF Data $3M to $5M 6.4x; FPS HVAC $1M to $5M 7.4x to 9.2x
        { max: 10e6,     lo: 6.0,  hi: 8.0 },    // EBITDA: GF Data $5M to $10M 6.8x to 7.4x; FPS HVAC 8.4x to 10.8x
        { max: Infinity, lo: 7.0,  hi: 9.0 }     // EBITDA: GF Data over $10M 7.4x to 8.3x; HVAC-specific data not verified
      ],
      /* Segment factors: First Page Sage shows residential all-purpose above commercial (9.2x vs
       * 7.4x to 8.0x at $1M to $5M). Practitioner guides report 1 to 2 turns lower for builder-heavy
       * shops (not a primary dataset). Factors are deliberately smaller than those spreads. */
      segments: [
        ['Residential service and replacement', 1.00],
        ['Commercial service and maintenance', 0.95],
        ['Mix of service and new construction', 0.90],
        ['Mostly new construction installs', 0.80]
      ],
      /* Revenue cross-check: BizBuySell HVAC sold, revenue multiple lower to upper quartile 0.38x to 0.74x */
      revenueCheck: { lo: 0.38, hi: 0.74, text: 'half of HVAC businesses sold on BizBuySell from 2021 to 2025 went for 38% to 74% of annual revenue' },
      questions: [
        { id: 'agreements', w: 20, q: 'What share of your revenue comes from customers on maintenance agreements?',
          opts: [['30% or more', 1], ['10% to 30%', 0.5], ['Under 10%', 0]],
          gap: 'Maintenance agreements. Buyers of HVAC companies pay for predictable revenue, and a membership base is the clearest proof of it. A thin agreement base means more of the price rides on work you have to win again every year.' },
        { id: 'license', w: 15, q: 'Is anyone besides you licensed to serve as the company’s Texas air conditioning contractor of record?',
          opts: YES_GOOD,
          gap: 'License dependence. In Texas, an HVAC company works under a TDLR air conditioning and refrigeration contractor license. If yours is the only one, a buyer has to solve that before closing, and it gives them leverage on price and terms.' },
        { id: 'techs', w: 15, q: 'Have most of your technicians been with you for two years or more?',
          opts: [['Most have', 1], ['About half', 0.5], ['Few have', 0]],
          gap: 'Technician retention. Skilled techs are the hardest thing to replace in this trade. High turnover tells a buyer the revenue may walk out the door with the people.' },
        { id: 'calls', w: 15, q: 'Are you still running service calls or selling replacements yourself most weeks?',
          opts: NO_GOOD,
          gap: 'Owner in the field. If you are still on calls or closing the big tickets, a buyer sees the business as a job, not an asset, and discounts the price or ties more of it to an earnout.' },
        { id: 'builders', w: 10, q: 'Does more than 20% of revenue come from new-construction builders or general contractors?',
          opts: NO_GOOD,
          gap: 'Builder concentration. New-construction work rises and falls with housing starts and depends on a few relationships. Buyers usually value it below service and replacement revenue.' },
        { id: 'fleet', w: 10, q: 'Are your trucks and equipment in good shape, with no big replacement bill due in the next two years?',
          opts: YES_GOOD,
          gap: 'Fleet and equipment. An aging fleet is a cost the buyer will have to pay, and they will usually take it off the price.' },
        { id: 'books', w: 15, q: 'Are your financials reviewed or audited by a CPA, with job costing you trust?',
          opts: YES_GOOD,
          gap: 'Financial records. Clean, reviewed statements and reliable job costing shorten due diligence and protect the price you agreed on.' }
      ]
    },

    dental: {
      key: 'dental',
      noun: 'dental practice',
      article: 'a',
      /* DENTAL_BANDS (multiple of profit before the owner-dentist's own pay). Full table:
       * ops/niche-multiples-sources.md
       * 1. BizBuySell Dental Practice Valuation Benchmarks (sold 2021 to 2025, viewed Oct 2026): SDE
       *    multiple lower quartile 1.60x, median 2.48x, average 2.63x, upper quartile 3.37x;
       *    revenue multiple 0.51x / 0.70x / 0.86x.
       * 2. Peak Business Valuation, Dental Practice Valuation Multiples: 1.0x to 2.0x SDE,
       *    1.8x to 2.7x EBITDA, 0.46x to 0.67x revenue (undated page).
       * 3. FOCUS Investment Banking, Dental Practice EBITDA Multiples 2026 (Apr 27, 2026): general
       *    dentistry add-on 5x to 8x EBITDA, platform 9x to 12x; by EBITDA: under $1M 5x to 7x,
       *    $1M to $3M 7x to 9x, $3M to $5M 9x to 11x. EBITDA here is AFTER resetting owner pay to a
       *    market dentist wage, so it is much smaller than our input.
       * Small bands sit on the BizBuySell quartiles (private dentist buyers, SBA style financing).
       * Larger bands are set far below FOCUS because owner-dentist clinical pay is a large share of
       * profit before owner pay in a dental practice.
       */
      bands: [
        { max: 500e3,    lo: 1.5,  hi: 2.4 },    // SDE: Peak 1.0x to 2.0x; BizBuySell dental lower quartile 1.60x to median 2.48x
        { max: 1e6,      lo: 1.9,  hi: 2.75 },   // SDE: BizBuySell dental median 2.48x, below upper quartile 3.37x
        { max: 2e6,      lo: 2.5,  hi: 4.0 },   // multi-doctor: BizBuySell upper quartile 3.37x; FOCUS under $1M EBITDA 5x to 7x after pay reset
        { max: 5e6,      lo: 4.5,  hi: 6.5 },    // DSO range: FOCUS $1M to $3M EBITDA 7x to 9x, discounted for owner pay in input
        { max: Infinity, lo: 6.0,  hi: 8.5 }     // DSO range: FOCUS $3M to $5M 9x to 11x, platforms 9x to 12x, discounted
      ],
      /* No specialty factor: specialty premiums are reported only by secondary sources we could not
       * verify, so every practice type uses 1.00. The type is still collected for the advisor. */
      segments: [
        ['General dentistry', 1.00],
        ['Orthodontics', 1.00],
        ['Pediatric dentistry', 1.00],
        ['Oral surgery', 1.00],
        ['Endodontics', 1.00],
        ['Periodontics', 1.00],
        ['Other specialty', 1.00]
      ],
      /* Revenue cross-check: BizBuySell dental sold, revenue multiple lower to upper quartile 0.51x to 0.86x */
      revenueCheck: { lo: 0.51, hi: 0.86, text: 'half of dental practices sold on BizBuySell from 2021 to 2025 went for 51% to 86% of annual collections' },
      questions: [
        { id: 'associate', w: 20, q: 'Is there an associate dentist in place who would stay after a sale?',
          opts: YES_GOOD,
          gap: 'No associate in place. When the practice depends on one dentist, a buyer is buying your hands. An associate who stays makes the patient base transferable and opens the door to more buyers.' },
        { id: 'ownerprod', w: 15, q: 'What share of the practice’s dentist production do you personally do?',
          opts: [['Under 50%', 1], ['50% to 75%', 0.5], ['Over 75%', 0]],
          gap: 'Owner production share. If most of the dentistry is yours, buyers expect you to stay on for years after the sale, often with part of the price tied to it.' },
        { id: 'hygiene', w: 15, q: 'What share of total production comes from hygiene?',
          opts: [['30% or more', 1], ['20% to 30%', 0.5], ['Under 20%', 0]],
          gap: 'Hygiene production. A strong hygiene program keeps patients coming back and feeds the restorative schedule. A thin one tells a buyer the patient base may not hold.' },
        { id: 'payer', w: 15, q: 'What share of collections comes from PPO insurance plans at contracted fees?',
          opts: [['Under 40%', 1], ['40% to 70%', 0.5], ['Over 70%', 0]],
          gap: 'Insurance dependence. Heavy PPO reliance means lower fees and margins set by the plans, not by you. Buyers price in that pressure, especially private dentists buying with a loan.' },
        { id: 'lease', w: 15, q: 'Does your office lease have 10 or more years left, counting renewal options?',
          opts: YES_GOOD,
          gap: 'Lease term. Buyers and their lenders usually want a lease that runs as long as the loan. A short lease, or one that cannot be assigned, can stall or sink a sale.' },
        { id: 'growth', w: 10, q: 'Have collections grown over the last three years?',
          opts: YES_GOOD,
          gap: 'Growth trend. Buyers pay for where the practice is going, and flat or falling collections lower what they will offer.' },
        { id: 'books', w: 10, q: 'Are your financials prepared by a CPA, with clean production and collections reports?',
          opts: YES_GOOD,
          gap: 'Financial records. Clean statements that tie to your practice management reports shorten due diligence and protect the price you agreed on.' }
      ]
    }
  };

  var CFG = CONFIGS[window.CALC_INDUSTRY] || {
    key: '', noun: '', bands: SIZE_BANDS, segments: INDUSTRIES, questions: QUESTIONS
  };

  var FED_CAP_GAINS = 0.238; // 20% long-term capital gains + 3.8% net investment income tax, simplified

  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + (Math.round(n / 1e4) * 1e4).toLocaleString('en-US'); };   // estimates: nearest $10K
  var num = function(el){ return parseFloat(String(el.value).replace(/[^0-9.]/g, '')) || 0; };
  var answers = {}, step = 1, result = null;

  // Build segment list and questions
  CFG.segments.forEach(function(i, k){ var o = document.createElement('option'); o.value = k; o.textContent = i[0]; $('industry').appendChild(o); });
  $('industry').insertAdjacentHTML('afterbegin', '<option value="" selected disabled>Choose one</option>');
  CFG.questions.forEach(function(q){
    $('questions').insertAdjacentHTML('beforeend',
      '<div class="q" data-q="' + q.id + '"><p>' + q.q + '</p><div class="opts">' +
      q.opts.map(function(o, k){ return '<button type="button" data-v="' + k + '">' + o[0] + '</button>'; }).join('') +
      '</div></div>');
  });
  document.querySelectorAll('.q').forEach(function(el){
    el.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on'); answers[el.dataset.q] = +b.dataset.v; el.classList.remove('err');
    });
  });

  // Format money inputs as the user types
  document.querySelectorAll('.money input').forEach(function(el){
    el.addEventListener('input', function(){ var n = num(el); el.value = n ? n.toLocaleString('en-US') : ''; });
  });

  function valid(s){
    var ok = true, mark = function(el, bad){ el.closest('label').classList.toggle('err', bad); if (bad) ok = false; };
    if (s === 1){ mark($('industry'), $('industry').value === ''); mark($('profit'), num($('profit')) <= 0); }
    if (s === 2){ CFG.questions.forEach(function(q){ if (answers[q.id] === undefined){ document.querySelector('[data-q="' + q.id + '"]').classList.add('err'); ok = false; } }); }
    if (s === 3){ mark($('need'), num($('need')) <= 0); }
    return ok;
  }

  function go(s){
    step = s;
    document.querySelectorAll('.step').forEach(function(el){ el.classList.toggle('on', +el.dataset.step === s); });
    document.querySelectorAll('.calc-steps span').forEach(function(el, i){ el.classList.toggle('on', i < s); });
    $('bar').style.width = (Math.min(s, 3) / 3 * 100) + '%';
    $('calc').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Readable answers for the team alert: [question, answer] pairs
  function answerText(){
    return CFG.questions.map(function(q){ return [q.q, q.opts[answers[q.id]][0]]; });
  }

  function compute(){
    var profit = num($('profit')), seg = CFG.segments[+$('industry').value];
    var band = CFG.bands.filter(function(b){ return profit < b.max; })[0];
    var score = 0;
    CFG.questions.forEach(function(q){
      var pts = q.opts[answers[q.id]][1];
      score += q.w * pts; q.pts = pts;
    });
    score = Math.round(score);
    var lo = band.lo * seg[1], hi = band.hi * seg[1];
    var mid = lo + (hi - lo) * score / 100;          // readiness sets where you land in the range
    var vLo = profit * mid * 0.9, vHi = profit * mid * 1.1, vMid = profit * mid;
    var taxRate = FED_CAP_GAINS + parseFloat($('state').value);
    var debt = num($('debt')), need = num($('need'));
    var net = vMid * (1 - taxRate) - debt;
    var ready = profit * hi;                         // value if the business scored 100
    return { industryKey: CFG.key, industry: CFG.key ? CFG.noun + ' (' + seg[0] + ')' : seg[0],
             profit: profit, score: score, lo: lo, hi: hi, mid: mid, vLo: vLo, vHi: vHi, vMid: vMid,
             taxRate: taxRate, debt: debt, need: need, net: net, gap: need - net, upside: Math.max(0, ready - vMid),
             revenue: num($('revenue')), timeline: $('timeline').value };
  }

  function showScore(r){
    var c = 2 * Math.PI * 52;
    $('gfg').style.strokeDasharray = c; $('gfg').style.strokeDashoffset = c;
    var t0 = null, done = false;
    var finish = function(){ done = true; $('gfg').style.strokeDashoffset = c * (1 - r.score / 100); $('score').textContent = r.score; };
    var tick = function(ts){
      if (done) return;
      if (t0 === null){ t0 = ts; $('gfg').style.strokeDashoffset = c * (1 - r.score / 100); }
      var p = Math.min(1, (ts - t0) / 900);
      $('score').textContent = Math.round(r.score * p);
      if (p < 1) requestAnimationFrame(tick); else finish();
    };
    requestAnimationFrame(tick);
    setTimeout(finish, 1300);   // background tabs throttle animation frames; always land on the final value
    var label = r.score >= 80 ? 'Buyer ready' : r.score >= 55 ? 'Getting there' : 'Early stage';
    var what = CFG.key ? 'Your ' + CFG.noun.split(' ').pop() : 'Your business';
    $('score-head').textContent = label;
    $('score-line').textContent = r.score >= 80
      ? what + ' has most of what buyers pay a premium for. The work now is protecting that value through the sale.'
      : r.score >= 55
        ? 'You have a real foundation, and a few gaps that could cost you at the closing table. Most can be closed in one to three years.'
        : 'Right now a buyer would likely see risk that pushes the price down. The good news: these are fixable with time and a plan.';
    var gaps = CFG.questions.filter(function(q){ return q.pts < 1; }).sort(function(a, b){ return (b.w * (1 - b.pts)) - (a.w * (1 - a.pts)); }).slice(0, 3);
    $('gaps').innerHTML = gaps.length
      ? gaps.map(function(q){ return '<li>' + q.gap + '</li>'; }).join('')
      : '<li>No major gaps from these questions. A full review looks deeper at contracts, taxes, and deal structure.</li>';
  }

  function showFull(r){
    var noun = CFG.key ? CFG.noun : r.industry.toLowerCase() + ' business';
    var article = CFG.article || (/^[aeiou]/.test(noun) ? 'an' : 'a');
    $('r-val').textContent = money(r.vLo) + ' to ' + money(r.vHi);
    $('r-mult').textContent = 'About ' + r.mid.toFixed(1) + 'x annual profit for ' + article + ' ' + noun + ' your size';
    if (CFG.revenueCheck && r.revenue > 0){
      $('r-mult').textContent += '. For comparison, ' + CFG.revenueCheck.text + ', which would be ' +
        money(r.revenue * CFG.revenueCheck.lo) + ' to ' + money(r.revenue * CFG.revenueCheck.hi) + ' for you.';
    }
    $('r-net').textContent = money(Math.max(0, r.net));
    $('r-tax').textContent = 'After an estimated ' + Math.round(r.taxRate * 100) + '% in taxes' + (r.debt ? ' and ' + money(r.debt) + ' in debt' : '');
    if (r.gap > 0){
      $('r-gap').textContent = money(r.gap);
      $('r-gap-note').textContent = 'Short of the ' + money(r.need) + ' you said you need';
      $('gap-card').classList.add('short');
    } else {
      $('r-gap').textContent = 'None';
      $('r-gap-note').textContent = 'You clear your ' + money(r.need) + ' goal by about ' + money(-r.gap);
      $('gap-card').classList.remove('short');
    }
    var what = CFG.key ? 'this ' + CFG.noun.split(' ').pop() : 'this business';
    $('upside').innerHTML = r.upside > 1000
      ? '<p><strong>Readiness is worth money.</strong> If ' + what + ' scored 100 instead of ' + r.score + ', the same profit points to roughly <strong>' + money(r.upside) + ' more</strong> at sale. That is what closing the gaps above is worth.</p>'
      : '<p><strong>Your readiness is already strong.</strong> From here, the biggest levers are growing profit and structuring the deal and your taxes well.</p>';
  }

  document.querySelectorAll('[data-next]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!valid(step)) return;
      if (step === 3){ result = compute(); go(4); showScore(result); if (window.gtag) gtag('event', 'exit_calc_complete', { calc_industry: CFG.key || 'generic' }); }
      else go(step + 1);
    });
  });
  document.querySelectorAll('[data-back]').forEach(function(b){ b.addEventListener('click', function(){ go(step - 1); }); });
  document.querySelector('[data-restart]').addEventListener('click', function(){ go(1); });

  var loadedAt = Date.now();
  $('gate').addEventListener('submit', function(e){
    e.preventDefault();
    var f = this, btn = f.querySelector('button'); btn.textContent = 'One moment...'; btn.disabled = true;
    var reveal = function(){ $('locked').hidden = true; $('unlocked').hidden = false; showFull(result); };
    fetch('/api/exit-calculator', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: f.first.value, email: f.email.value, website: f.website.value, _t: loadedAt,
                             source: 'exit-calculator' + (CFG.key ? '-' + CFG.key : ''), industry: CFG.key,
                             answers: answerText(), result: result })
    }).then(reveal, reveal);
    if (window.gtag) gtag('event', 'exit_calc_lead', { calc_industry: CFG.key || 'generic' });
  });
})();
