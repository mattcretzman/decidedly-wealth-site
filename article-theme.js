/* Scroll-linked article themes. Decorative only (aria-hidden), never covers text.
   <body data-theme="flag">  : a US flag hoists up a pole as the reader moves through the article.
   <body data-theme="leaves">: a few fall leaves drift down the margins as the reader scrolls. */
(function () {
  'use strict';
  var theme = document.body.getAttribute('data-theme');
  var post = document.querySelector('.post-wrap');
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
    '.at-leaf{position:absolute;top:0;width:30px;height:30px;will-change:transform}',
    '@media(max-width:1180px){.at-leaf{width:20px;height:20px;opacity:.55}}',
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
    var leafPath = 'M15 1c2 4 6 5 9 4-1 4 1 7 5 8-4 2-5 5-4 9-3-1-6 0-8 3l-1 4-1-4c-2-3-5-4-8-3 1-4 0-7-4-9 4-1 6-4 5-8 3 1 7 0 8-4z';
    var layer = document.createElement('div');
    layer.className = 'at-layer at-leaves';
    layer.setAttribute('aria-hidden', 'true');
    var leaves = [];
    for (var k = 0; k < 8; k++) {
      var side = k % 2;
      var d = document.createElement('div');
      d.className = 'at-leaf';
      d.innerHTML = '<svg viewBox="0 0 30 30"><path d="' + leafPath + '" fill="' + colors[k % colors.length] + '" opacity=".8"/></svg>';
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
