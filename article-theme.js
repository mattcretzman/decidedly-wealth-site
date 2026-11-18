/* Scroll-linked article themes. Decorative only (aria-hidden), never covers text.
   <body data-theme="flag">  : a US flag hoists up a pole as the reader moves through the article.
   <body data-theme="leaves">: a few fall leaves drift down the margins as the reader scrolls. */
(function () {
  'use strict';
  var theme = document.body.getAttribute('data-theme');
  var post = document.querySelector('.post-wrap') || document.querySelector('.blog-body');
  if (!theme || !post) return;

  var css = document.createElement('style');
  css.textContent = [
    '.at-layer{position:fixed;top:0;bottom:0;pointer-events:none;z-index:5;transition:opacity .4s}',
    /* Flag: right gutter on wide screens, slim edge pole on phones */
    '.at-pole{right:max(24px,calc((100vw - 720px)/2 - 150px));width:110px}',
    '.at-pole .mast{position:absolute;left:6px;top:12vh;bottom:6vh;width:4px;border-radius:2px;background:linear-gradient(90deg,#8d8d8d,#d9d9d9 45%,#9a9a9a)}',
    '.at-pole .knob{position:absolute;left:2px;top:calc(12vh - 10px);width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f3dca8,#C8956C 60%,#8a6240)}',
    '.at-pole .base{position:absolute;left:-2px;bottom:calc(6vh - 4px);width:20px;height:6px;border-radius:2px;background:#9a9a9a}',
    '.at-pole .rope{position:absolute;left:11px;top:12vh;bottom:6vh;width:1px;background:rgba(0,0,0,.18)}',
    '.at-pole .flag{position:absolute;left:10px;top:12vh;width:96px;height:51px;will-change:transform;transform-origin:left center}',
    '.at-pole .flag svg{display:block;width:100%;height:100%;animation:at-wave 3.2s ease-in-out infinite;transform-origin:left center;filter:drop-shadow(0 2px 3px rgba(0,0,0,.15))}',
    '@keyframes at-wave{0%,100%{transform:skewY(0) scaleX(1)}50%{transform:skewY(-2deg) scaleX(.97)}}',
    '@media(max-width:1180px){.at-pole{right:6px;width:58px}.at-pole .flag{width:48px;height:26px}.at-pole{opacity:.85}}',
    /* Leaves */
    '.at-leaves{left:0;right:0;overflow:hidden}',
    '.at-leaf{position:absolute;top:0;width:34px;height:40px;opacity:.85;will-change:transform}',
    '@media(max-width:1180px){.at-leaf{width:22px;height:26px;opacity:.5}}',
    '.at-gutter{right:max(16px,calc((100vw - 720px)/2 - 170px));width:130px;display:flex;align-items:center}',
    '.at-gutter svg{width:100%;height:auto;max-height:76vh;overflow:visible}',
    '@media(max-width:1180px){.at-gutter{right:4px;width:64px;opacity:.85}}',
    '@media(prefers-reduced-motion:reduce){.at-pole .flag svg{animation:none}}'
  ].join('\n');
  document.head.appendChild(css);

  function progress() {
    var r = post.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = r.height - vh * 0.15;
    var done = vh * 0.6 - r.top;
    return Math.max(0, Math.min(1, total > 0 ? done / total : 1));
  }

  var update;
  if (theme === 'flag') {
    var stripes = '';
    for (var i = 0; i < 13; i++) stripes += '<rect y="' + (i * 10) + '" width="247" height="10" fill="' + (i % 2 ? '#fff' : '#B22234') + '"/>';
    var stars = '';
    for (var row = 0; row < 9; row++) {
      var n = row % 2 ? 5 : 6;
      for (var c = 0; c < n; c++) stars += '<circle cx="' + (8.2 + c * 16.5 + (row % 2 ? 8.2 : 0)) + '" cy="' + (7 + row * 7) + '" r="2.4" fill="#fff"/>';
    }
    var el = document.createElement('div');
    el.className = 'at-layer at-pole';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="rope"></div><div class="mast"></div><div class="knob"></div><div class="base"></div>' +
      '<div class="flag"><svg viewBox="0 0 247 130" preserveAspectRatio="none">' + stripes +
      '<rect width="99" height="70" fill="#3C3B6E"/>' + stars + '</svg></div>';
    document.body.appendChild(el);
    var flag = el.querySelector('.flag');
    update = function () {
      var travel = el.querySelector('.mast').offsetHeight - flag.offsetHeight;
      flag.style.transform = 'translateY(' + ((1 - progress()) * travel).toFixed(1) + 'px)';
    };
  } else if (theme === 'leaves') {
    var colors = ['#b5673a', '#C8956C', '#9c4a24', '#d4a35a', '#8a5a2b', '#c07a3e'];
    var leafSvg = function (col, kind) {
      var body = kind ? 'M20 3C31 9 35 22 20 37C5 22 9 9 20 3Z'
        : 'M20 3l3.5 7 5.5-3-1 7.5 7.5-1.5-3.5 6 6.5 3-7.5 3 2.5 5.5-7.5-2-1.5 6.5-4-4.5-4 4.5-1.5-6.5-7.5 2 2.5-5.5-7.5-3 6.5-3-3.5-6 7.5 1.5-1-7.5 5.5 3Z';
      return '<svg viewBox="0 0 40 46"><path d="' + body + '" fill="' + col + '"/>' +
        '<path d="M20 8V44" stroke="rgba(60,30,10,.45)" stroke-width="1.2" fill="none"/>' +
        (kind ? '<path d="M20 16l-6-4M20 22l7-5M20 28l-7-4" stroke="rgba(60,30,10,.3)" stroke-width="1" fill="none"/>' : '') + '</svg>';
    };
    var layer = document.createElement('div');
    layer.className = 'at-layer at-leaves';
    layer.setAttribute('aria-hidden', 'true');
    var leaves = [];
    for (var k = 0; k < 8; k++) {
      var side = k % 2;
      var d = document.createElement('div');
      d.className = 'at-leaf';
      d.innerHTML = leafSvg(colors[k % colors.length], true);
      layer.appendChild(d);
      leaves.push({ el: d, side: side, x: 0.04 + ((k * 37) % 100) / 100 * 0.12, delay: k / 8 * 0.55, spin: 120 + k * 45, sway: 18 + (k % 3) * 10 });
    }
    document.body.appendChild(layer);
    update = function () {
      var p = progress(), vh = window.innerHeight, vw = window.innerWidth;
      leaves.forEach(function (l) {
        var t = Math.max(0, Math.min(1, (p - l.delay) / 0.45));
        var y = -40 + t * (vh + 80);
        var x = (l.side ? vw * (1 - l.x) - 30 : vw * l.x) + Math.sin(t * Math.PI * 2) * l.sway;
        l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (t * l.spin).toFixed(0) + 'deg)';
        l.el.style.opacity = t > 0 && t < 1 ? '' : '0';
      });
    };
  }

  /* Gutter illustrations: one SVG beside the article, redrawn from reading progress p (0 to 1). */
  var NS = 'http://www.w3.org/2000/svg';
  function gutter(viewBox, build) {
    var wrap = document.createElement('div');
    wrap.className = 'at-layer at-gutter';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<svg viewBox="' + viewBox + '">' + build + '</svg>';
    document.body.appendChild(wrap);
    return wrap.querySelector('svg');
  }
  function q(svg, sel) { return svg.querySelector(sel); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(t) { return Math.max(0, Math.min(1, t)); }
  var INK = '#053894', COPPER = '#C8956C', DEEP = '#032666';

  if (theme === 'calendar') {
    /* Tear-off calendar: the date runs from Nov 1 to Dec 31 as the reader moves through. */
    var cal = gutter('0 0 120 150',
      '<rect x="10" y="20" width="100" height="120" rx="8" fill="#fff" stroke="rgba(0,0,0,.12)"/>' +
      '<rect x="10" y="20" width="100" height="34" rx="8" fill="#B22234"/><rect x="10" y="44" width="100" height="10" fill="#B22234"/>' +
      '<circle cx="35" cy="20" r="5" fill="#666"/><circle cx="85" cy="20" r="5" fill="#666"/>' +
      '<text class="m" x="60" y="44" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="15" letter-spacing="3" fill="#fff">NOV</text>' +
      '<text class="d" x="60" y="112" text-anchor="middle" font-family="Playfair Display,serif" font-size="54" font-weight="700" fill="' + DEEP + '">1</text>' +
      '<g class="tear"><rect x="10" y="54" width="100" height="86" fill="#fff"/></g>');
    var lastDay = -1;
    update = function () {
      var day = Math.round(progress() * 60);
      if (day === lastDay) return;
      lastDay = day;
      var nov = day < 30;
      q(cal, '.m').textContent = nov ? 'NOV' : 'DEC';
      q(cal, '.d').textContent = nov ? day + 1 : day - 29;
      q(cal, '.d').setAttribute('fill', day === 60 ? '#B22234' : DEEP);
      var tear = q(cal, '.tear');
      tear.style.transition = 'none'; tear.style.transform = 'none'; tear.style.opacity = '1';
      void tear.getBoundingClientRect();
      tear.style.transition = 'transform .5s ease-in, opacity .5s';
      tear.style.transform = 'translate(30px,60px) rotate(25deg)'; tear.style.opacity = '0';
    };
  } else if (theme === 'eggs') {
    /* Six eggs start in one basket and settle into three as the reader goes. */
    var basket = function (x, y, w) {
      return '<path d="M' + (x - w) + ' ' + y + 'h' + (2 * w) + 'l-' + (w * 0.2) + ' ' + (w * 0.8) + 'h-' + (w * 1.6) + 'z" fill="' + COPPER + '"/>' +
        '<path d="M' + (x - w * 0.9) + ' ' + (y + w * 0.3) + 'h' + (w * 1.8) + 'M' + (x - w * 0.85) + ' ' + (y + w * 0.55) + 'h' + (w * 1.7) + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/>' +
        '<path d="M' + (x - w * 0.8) + ' ' + y + 'q' + (w * 0.8) + ' -' + (w * 1.1) + ' ' + (w * 1.6) + ' 0" stroke="' + COPPER + '" stroke-width="4" fill="none"/>';
    };
    var eg = gutter('0 0 130 300', basket(65, 70, 34) + basket(25, 270, 20) + basket(65, 220, 20) + basket(105, 270, 20) +
      [0, 1, 2, 3, 4, 5].map(function (i) { return '<ellipse class="egg" rx="8" ry="10" fill="#fbf6ea" stroke="rgba(0,0,0,.18)"/>'; }).join(''));
    var start = [[47, 62], [59, 58], [71, 58], [83, 62], [55, 50], [75, 50]];
    var end = [[18, 262], [32, 262], [58, 212], [72, 212], [98, 262], [112, 262]];
    var eggs = eg.querySelectorAll('.egg');
    update = function () {
      var p = progress();
      for (var i = 0; i < 6; i++) {
        var t = clamp((p - i * 0.1) / 0.4);
        var e = t * t * (3 - 2 * t);
        var x = lerp(start[i][0], end[i][0], e), y = lerp(start[i][1], end[i][1], e) - Math.sin(e * Math.PI) * 30;
        eggs[i].setAttribute('cx', x.toFixed(1)); eggs[i].setAttribute('cy', y.toFixed(1));
      }
    };
  } else if (theme === 'jar') {
    /* A savings jar that fills, one coin at a time. */
    var coins = '';
    for (var cc = 0; cc < 16; cc++) coins += '<g class="coin"><ellipse rx="13" ry="5" fill="#d4a35a" stroke="#a8792f" stroke-width="1.5"/></g>';
    var jar = gutter('0 0 120 240',
      '<rect x="38" y="40" width="44" height="12" rx="3" fill="' + INK + '"/>' +
      '<path d="M30 60h60q8 0 8 10v140q0 18-18 18h-40q-18 0-18-18v-140q0-10 8-10z" fill="rgba(5,56,148,.05)" stroke="' + INK + '" stroke-width="3"/>' +
      coins + '<path d="M36 70v130" stroke="rgba(255,255,255,.7)" stroke-width="4" stroke-linecap="round"/>');
    var coinEls = jar.querySelectorAll('.coin');
    update = function () {
      var p = progress();
      for (var i = 0; i < 16; i++) {
        var t = clamp(p * 16 - i);
        var restY = 218 - i * 9, restX = 60 + ((i * 7) % 11) - 5;
        var y = lerp(-10, restY, t * t);
        coinEls[i].setAttribute('transform', 'translate(' + restX + ',' + y.toFixed(1) + ')');
        coinEls[i].style.opacity = t > 0 ? '1' : '0';
      }
    };
  } else if (theme === 'tree') {
    /* A family tree: trunk first, then branches, then leaves, one generation at a time. */
    var branches = [
      'M60 200 C60 170 58 140 60 110', 'M60 160 C45 150 35 140 28 125', 'M60 150 C75 140 85 128 92 112',
      'M60 125 C50 112 44 100 40 86', 'M60 118 C70 106 78 96 82 80', 'M60 110 C60 95 60 80 60 62'
    ];
    var leafSpots = [[28, 122], [22, 112], [36, 116], [92, 108], [100, 100], [86, 102], [40, 82], [32, 76], [48, 76], [82, 76], [90, 68], [74, 70], [60, 58], [52, 50], [68, 50], [60, 42]];
    var tr = gutter('0 0 120 220',
      '<path d="M30 205h60" stroke="rgba(0,0,0,.12)" stroke-width="3" stroke-linecap="round"/>' +
      branches.map(function (d, i) { return '<path class="br" d="' + d + '" fill="none" stroke="#7a5230" stroke-width="' + (i === 0 ? 7 : 4) + '" stroke-linecap="round"/>'; }).join('') +
      leafSpots.map(function (c, i) { return '<circle class="lf" cx="' + c[0] + '" cy="' + c[1] + '" r="7" fill="' + (i % 3 ? '#5f8a4a' : '#7aa35e') + '"/>'; }).join(''));
    var brs = tr.querySelectorAll('.br'), lfs = tr.querySelectorAll('.lf');
    for (var b = 0; b < brs.length; b++) { var L = brs[b].getTotalLength(); brs[b].style.strokeDasharray = L; brs[b].dataset.len = L; }
    update = function () {
      var p = progress();
      for (var i = 0; i < brs.length; i++) { var t = clamp((p - i * 0.09) / 0.2); brs[i].style.strokeDashoffset = (brs[i].dataset.len * (1 - t)).toFixed(1); }
      for (var j = 0; j < lfs.length; j++) { var u = clamp((p - 0.35 - j * 0.035) / 0.12); lfs[j].setAttribute('r', (7 * u).toFixed(2)); }
    };
  } else if (theme === 'hourglass') {
    /* Sand runs from the top bulb to the bottom as the reader moves through. */
    var hg = gutter('0 0 120 240',
      '<defs><clipPath id="atTop"><path d="M28 30h64c0 40-26 58-30 90h-4c-4-32-30-50-30-90z"/></clipPath>' +
      '<clipPath id="atBot"><path d="M28 210h64c0-40-26-58-30-90h-4c-4 32-30 50-30 90z"/></clipPath></defs>' +
      '<rect class="st" x="20" y="30" width="80" height="90" fill="' + COPPER + '" clip-path="url(#atTop)"/>' +
      '<rect class="sb" x="20" y="210" width="80" height="0" fill="' + COPPER + '" clip-path="url(#atBot)"/>' +
      '<line class="stream" x1="60" y1="118" x2="60" y2="208" stroke="' + COPPER + '" stroke-width="2"/>' +
      '<path d="M28 30h64c0 40-26 58-30 90 4 32 30 50 30 90h-64c0-40 26-58 30-90-4-32-30-50-30-90z" fill="rgba(5,56,148,.04)" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="18" y="20" width="84" height="10" rx="3" fill="' + DEEP + '"/><rect x="18" y="210" width="84" height="10" rx="3" fill="' + DEEP + '"/>');
    update = function () {
      var p = progress();
      var top = q(hg, '.st'), bot = q(hg, '.sb');
      top.setAttribute('y', (30 + 90 * p).toFixed(1)); top.setAttribute('height', (90 * (1 - p)).toFixed(1));
      var h = 75 * p; bot.setAttribute('y', (210 - h).toFixed(1)); bot.setAttribute('height', h.toFixed(1));
      q(hg, '.stream').style.opacity = p > 0.01 && p < 0.99 ? '1' : '0';
    };
  } else if (theme === 'sunset') {
    /* Golden hour: the sun lowers toward the horizon and the sky warms. */
    var sn = gutter('0 0 120 240',
      '<defs><clipPath id="atSky"><rect x="10" y="10" width="100" height="220" rx="50"/></clipPath>' +
      '<linearGradient id="atWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c28b"/><stop offset="1" stop-color="#e07a4f"/></linearGradient></defs>' +
      '<g clip-path="url(#atSky)"><rect x="10" y="10" width="100" height="220" fill="#cfe3f3"/>' +
      '<rect class="warm" x="10" y="10" width="100" height="220" fill="url(#atWarm)" opacity="0"/>' +
      '<circle class="sun" cx="60" cy="50" r="18" fill="#f9d66b"/>' +
      '<path d="M10 175 Q40 160 60 172 T110 168 V230 H10Z" fill="' + DEEP + '"/></g>' +
      '<rect x="10" y="10" width="100" height="220" rx="50" fill="none" stroke="rgba(0,0,0,.1)"/>');
    update = function () {
      var p = progress();
      q(sn, '.sun').setAttribute('cy', lerp(50, 178, p).toFixed(1));
      q(sn, '.sun').setAttribute('fill', p > 0.6 ? '#f5a35a' : '#f9d66b');
      q(sn, '.warm').setAttribute('opacity', (p * 0.95).toFixed(2));
    };
  }
  if (!update) return;
  var foot = document.querySelector('footer');
  var layerEl = document.querySelector('.at-layer');
  function run() {
    update();
    if (foot) layerEl.style.opacity = foot.getBoundingClientRect().top < window.innerHeight - 40 ? '0' : '';
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; run(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  run();
})();
