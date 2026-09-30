/* Decidedly Wealth: Exit Planning Calculator (short version)
 *
 * MODEL NOTE: the multiple ranges below are sourced from published private
 * company transaction data (IBBA and M&A Source Market Pulse, GF Data,
 * BVR DealStats Value Index, Pepperdine Private Capital Markets Report),
 * as of 2026. They are general market ranges, not an appraisal, and they
 * still require compliance review before launch.
 * Full source table and methodology: ops/calculator-multiples-sources.md
 */
(function(){
  'use strict';

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

  // Readiness questions: weight, whether "yes" is good, and the gap message if not
  var QUESTIONS = [
    { id: 'owner',    w: 20, good: 'yes', q: 'Could the business run for three months without you?',
      gap: 'Owner dependence. If the business needs you every day, buyers see risk and discount the price or tie more of it to an earnout.' },
    { id: 'team',     w: 20, good: 'yes', q: 'Do you have a leadership team that would stay after a sale?',
      gap: 'Management depth. A team that stays after you leave is one of the biggest things buyers pay for.' },
    { id: 'books',    w: 15, good: 'yes', q: 'Are your financials reviewed or audited by a CPA?',
      gap: 'Financial records. Clean, reviewed statements shorten due diligence and protect the price you agreed on.' },
    { id: 'conc',     w: 15, good: 'no',  q: 'Does any one customer bring in more than 20% of revenue?',
      gap: 'Customer concentration. Losing one big customer after the sale would hurt, so buyers price that risk in.' },
    { id: 'recur',    w: 15, good: 'yes', q: 'Is a meaningful share of your revenue recurring or under contract?',
      gap: 'Predictable revenue. Recurring or contracted revenue is worth more than revenue you have to win again every year.' },
    { id: 'growth',   w: 15, good: 'yes', q: 'Has profit grown over the last three years?',
      gap: 'Growth trend. Buyers pay for where the business is going, and a flat or falling trend lowers the multiple.' }
  ];

  var FED_CAP_GAINS = 0.238; // 20% long-term capital gains + 3.8% net investment income tax, simplified

  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + (Math.round(n / 1e4) * 1e4).toLocaleString('en-US'); };   // estimates: nearest $10K
  var num = function(el){ return parseFloat(String(el.value).replace(/[^0-9.]/g, '')) || 0; };
  var answers = {}, step = 1, result = null;

  // Build industry list and questions
  INDUSTRIES.forEach(function(i, k){ var o = document.createElement('option'); o.value = k; o.textContent = i[0]; $('industry').appendChild(o); });
  $('industry').insertAdjacentHTML('afterbegin', '<option value="" selected disabled>Choose one</option>');
  QUESTIONS.forEach(function(q){
    $('questions').insertAdjacentHTML('beforeend',
      '<div class="q" data-q="' + q.id + '"><p>' + q.q + '</p><div class="opts">' +
      ['yes', 'somewhat', 'no'].map(function(v){ return '<button type="button" data-v="' + v + '">' + v.charAt(0).toUpperCase() + v.slice(1) + '</button>'; }).join('') +
      '</div></div>');
  });
  document.querySelectorAll('.q').forEach(function(el){
    el.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on'); answers[el.dataset.q] = b.dataset.v; el.classList.remove('err');
    });
  });

  // Format money inputs as the user types
  document.querySelectorAll('.money input').forEach(function(el){
    el.addEventListener('input', function(){ var n = num(el); el.value = n ? n.toLocaleString('en-US') : ''; });
  });

  function valid(s){
    var ok = true, mark = function(el, bad){ el.closest('label').classList.toggle('err', bad); if (bad) ok = false; };
    if (s === 1){ mark($('industry'), $('industry').value === ''); mark($('profit'), num($('profit')) <= 0); }
    if (s === 2){ QUESTIONS.forEach(function(q){ if (!answers[q.id]){ document.querySelector('[data-q="' + q.id + '"]').classList.add('err'); ok = false; } }); }
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

  function compute(){
    var profit = num($('profit')), ind = INDUSTRIES[+$('industry').value];
    var band = SIZE_BANDS.filter(function(b){ return profit < b.max; })[0];
    var score = 0;
    QUESTIONS.forEach(function(q){
      var a = answers[q.id], pts = a === 'somewhat' ? 0.5 : (a === q.good ? 1 : 0);
      score += q.w * pts; q.pts = pts;
    });
    score = Math.round(score);
    var lo = band.lo * ind[1], hi = band.hi * ind[1];
    var mid = lo + (hi - lo) * score / 100;          // readiness sets where you land in the range
    var vLo = profit * mid * 0.9, vHi = profit * mid * 1.1, vMid = profit * mid;
    var taxRate = FED_CAP_GAINS + parseFloat($('state').value);
    var debt = num($('debt')), need = num($('need'));
    var net = vMid * (1 - taxRate) - debt;
    var ready = profit * hi;                         // value if the business scored 100
    return { profit: profit, industry: ind[0], score: score, lo: lo, hi: hi, mid: mid, vLo: vLo, vHi: vHi, vMid: vMid,
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
    $('score-head').textContent = label;
    $('score-line').textContent = r.score >= 80
      ? 'Your business has most of what buyers pay a premium for. The work now is protecting that value through the sale.'
      : r.score >= 55
        ? 'You have a real foundation, and a few gaps that could cost you at the closing table. Most can be closed in one to three years.'
        : 'Right now a buyer would likely see risk that pushes the price down. The good news: these are fixable with time and a plan.';
    var gaps = QUESTIONS.filter(function(q){ return q.pts < 1; }).sort(function(a, b){ return (b.w * (1 - b.pts)) - (a.w * (1 - a.pts)); }).slice(0, 3);
    $('gaps').innerHTML = gaps.length
      ? gaps.map(function(q){ return '<li>' + q.gap + '</li>'; }).join('')
      : '<li>No major gaps from these questions. A full review looks deeper at contracts, taxes, and deal structure.</li>';
  }

  function showFull(r){
    $('r-val').textContent = money(r.vLo) + ' to ' + money(r.vHi);
    $('r-mult').textContent = 'About ' + r.mid.toFixed(1) + 'x annual profit for a ' + r.industry.toLowerCase() + ' business your size';
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
    $('upside').innerHTML = r.upside > 1000
      ? '<p><strong>Readiness is worth money.</strong> If this business scored 100 instead of ' + r.score + ', the same profit points to roughly <strong>' + money(r.upside) + ' more</strong> at sale. That is what closing the gaps above is worth.</p>'
      : '<p><strong>Your readiness is already strong.</strong> From here, the biggest levers are growing profit and structuring the deal and your taxes well.</p>';
  }

  document.querySelectorAll('[data-next]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!valid(step)) return;
      if (step === 3){ result = compute(); go(4); showScore(result); if (window.gtag) gtag('event', 'exit_calc_complete'); }
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
                             source: 'exit-calculator', answers: answers, result: result })
    }).then(reveal, reveal);
    if (window.gtag) gtag('event', 'exit_calc_lead');
  });
})();
