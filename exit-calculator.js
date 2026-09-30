/* Decidedly Wealth: Exit Planning Calculator (short version)
 *
 * MODEL NOTE: the multiple ranges below are WORKING VALUES for the preview.
 * They must be replaced with sourced data (Founders Advisors' method and/or
 * RJ's researched multiples) and approved by compliance before launch.
 */
(function(){
  'use strict';

  // Base EBITDA multiple range by profit size (smaller businesses sell for lower multiples)
  var SIZE_BANDS = [
    { max: 500e3,    lo: 2.5, hi: 3.5 },
    { max: 1e6,      lo: 3.0, hi: 4.5 },
    { max: 3e6,      lo: 4.0, hi: 5.5 },
    { max: 10e6,     lo: 5.0, hi: 7.0 },
    { max: Infinity, lo: 6.0, hi: 8.5 }
  ];

  // Industry adjustment applied to the size band
  var INDUSTRIES = [
    ['Construction and trades', 0.85],
    ['Distribution and wholesale', 0.95],
    ['Financial and insurance services', 1.10],
    ['Healthcare services', 1.15],
    ['Manufacturing', 1.00],
    ['Oil, gas and energy services', 0.85],
    ['Professional services', 0.95],
    ['Real estate services', 0.95],
    ['Restaurants and hospitality', 0.75],
    ['Retail', 0.80],
    ['Technology and software', 1.25],
    ['Transportation and logistics', 0.90],
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
