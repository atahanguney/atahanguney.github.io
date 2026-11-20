// atahanguney.github.io — shared behaviour (language, theme, menu, small figures)
(function () {
  var root = document.documentElement;

  /* ---------- language ---------- */
  function getLang() { return root.getAttribute('data-lang') === 'tr' ? 'tr' : 'en'; }
  function applyLang(lang, push) {
    if (lang === 'tr') root.setAttribute('data-lang', 'tr'); else root.removeAttribute('data-lang');
    root.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    var t = root.getAttribute('data-title-' + lang);
    if (t) document.title = t;
    var d = root.getAttribute('data-desc-' + lang), m = document.querySelector('meta[name="description"]');
    if (d && m) m.setAttribute('content', d);
    document.querySelectorAll('[data-setlang]').forEach(function (a) {
      var on = a.getAttribute('data-setlang') === lang;
      a.classList.toggle('on', on);
      a.setAttribute('aria-current', on ? 'true' : 'false');
    });
    // keep the language in internal links, so a shared link opens in the same language
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || a.hasAttribute('data-setlang') || /^(https?:|mailto:|#|\/\/)/.test(h)) return;
      if (/\.(png|jpe?g|webp|svg|pdf|csv|xml|txt)(\?|#|$)/i.test(h)) return;
      var hash = '', i = h.indexOf('#');
      if (i > -1) { hash = h.slice(i); h = h.slice(0, i); }
      h = h.replace(/[?&]lang=(en|tr)/, '').replace(/\?$/, '');
      if (lang === 'tr') h += (h.indexOf('?') > -1 ? '&' : '?') + 'lang=tr';
      a.setAttribute('href', (h || './') + hash);
    });
    if (push) {
      try {
        var u = new URL(location.href);
        if (lang === 'tr') u.searchParams.set('lang', 'tr'); else u.searchParams.delete('lang');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) {}
    }
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-setlang]');
    if (!a) return;
    ev.preventDefault();
    applyLang(a.getAttribute('data-setlang'), true);
  });
  applyLang(getLang(), false);

  /* ---------- theme ---------- */
  var tbtn = document.getElementById('theme');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function tlabel() { if (tbtn) tbtn.textContent = isDark() ? 'light' : 'dark'; }
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    tlabel();
  });
  tlabel();

  /* ---------- mobile menu ---------- */
  var mb = document.getElementById('menu'), nav = document.querySelector('.nav');
  if (mb && nav) mb.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- hero figure: voltage standing wave on a mismatched lossless line ----------
     Z0 = 50 ohm, ZL = 100 + j50 ohm  ->  Gamma = (ZL - Z0) / (ZL + Z0) = 0.4 + j0.2
     V(d) = V0+ (e^{jβd} + Γ e^{-jβd}),  d = distance from the load towards the generator */
  var swr = document.getElementById('swr');
  if (swr) {
    var ns = 'http://www.w3.org/2000/svg';
    var Z0 = 50, RL = 100, XL = 50;
    var nr = RL - Z0, dr = RL + Z0, den = dr * dr + XL * XL;
    var gr = (nr * dr + XL * XL) / den, gi = (XL * dr - nr * XL) / den;   // Γ = (nr + jXL)/(dr + jXL)
    var G = Math.hypot(gr, gi), th = Math.atan2(gi, gr);
    var xL = 380, xG = 30, y0 = 112, A = 50, PX = 280;                     // PX = pixels per wavelength
    var TWO_PI = 2 * Math.PI, n = 240;
    var mk = function (tag, attrs, parent) {
      var el = document.createElementNS(ns, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      (parent || swr).appendChild(el); return el;
    };
    var dAt = function (x) { return (xL - x) / PX; };                       // in wavelengths
    var xAt = function (d) { return xL - d * PX; };
    var env = function (d) { return Math.sqrt(1 + G * G + 2 * G * Math.cos(2 * TWO_PI * d - th)); };

    // grid every λ/4 + tick labels
    var grid = document.getElementById('swr-grid'), ticks = document.getElementById('swr-ticks');
    var lab = ['0', 'λ/4', 'λ/2', '3λ/4', 'λ', '5λ/4'];
    for (var q = 0; q <= 5; q++) {
      var gx = xAt(q / 4);
      mk('line', { x1: gx, x2: gx, y1: 30, y2: 196 }, grid);
      mk('text', { x: gx, y: 212 }, ticks).textContent = lab[q];
    }
    [y0 - A, y0 + A].forEach(function (gy) { mk('line', { x1: xG, x2: xL, y1: gy, y2: gy, 'stroke-dasharray': '2 3' }, grid); });

    // envelope ±|V(d)|
    var up = '', dn = '';
    for (var i = 0; i <= n; i++) {
      var x = xG + (xL - xG) * i / n, e = A * env(dAt(x));
      up += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - e).toFixed(1);
      dn += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 + e).toFixed(1);
    }
    document.getElementById('swr-env').setAttribute('d', up);
    document.getElementById('swr-env2').setAttribute('d', dn);
    var back = dn.replace(/M/, 'L').split('L').slice(1).reverse().join('L');
    document.getElementById('swr-band').setAttribute('d', up + 'L' + back + 'Z');

    // Vmax / Vmin markers and the λ/2 spacing
    var marks = document.getElementById('swr-marks');
    var dmax = th / (2 * TWO_PI); if (dmax < 0) dmax += 0.5;
    var dmin = dmax + 0.25;
    var vmax = 1 + G, vmin = 1 - G;
    [dmax, dmax + 0.5, dmax + 1].forEach(function (d) {
      if (d > 1.25) return;
      mk('circle', { cx: xAt(d), cy: y0 - A * vmax, r: 2.6, style: 'fill:var(--h)' }, marks);
    });
    [dmin, dmin + 0.5].forEach(function (d) {
      if (d > 1.25) return;
      var x = xAt(d);
      mk('line', { x1: x, x2: x, y1: y0 - A * vmin, y2: 196, style: 'stroke:var(--s)', 'stroke-dasharray': '3 3' }, marks);
      mk('circle', { cx: x, cy: y0 - A * vmin, r: 2.6, style: 'fill:var(--s)' }, marks);
    });
    var t1 = mk('text', { x: xAt(dmax + 0.5) + 5, y: y0 - A * vmax - 6, style: 'fill:var(--h)' }, marks);
    t1.textContent = 'Vmax = ' + vmax.toFixed(2);
    var t2 = mk('text', { x: xAt(dmin) + 4, y: 192, style: 'fill:var(--s)' }, marks);
    t2.textContent = 'Vmin = ' + vmin.toFixed(2);
    var ya = 22, xa = xAt(dmax + 1), xb = xAt(dmax + 0.5);
    mk('line', { x1: xa + 2, x2: xb - 2, y1: ya, y2: ya, style: 'stroke:var(--ink-3)', 'marker-start': 'url(#dim)', 'marker-end': 'url(#dim)' }, marks);
    var t3 = mk('text', { x: (xa + xb) / 2, y: ya - 5, style: 'fill:var(--ink-3)', 'text-anchor': 'middle' }, marks);
    t3.textContent = 'λ/2';

    // instantaneous voltage: v(d,t) = cos(βd + ωt) + |Γ| cos(θ - βd + ωt)
    var vw = document.getElementById('swr-v');
    var draw = function (wt) {
      var p = '';
      for (var i = 0; i <= n; i++) {
        var x = xG + (xL - xG) * i / n, bd = TWO_PI * dAt(x);
        var v = Math.cos(bd + wt) + G * Math.cos(th - bd + wt);
        p += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - A * v).toFixed(1);
      }
      vw.setAttribute('d', p);
    };
    draw(0.6);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var t0 = null;
      var tick = function (t) {
        if (t0 === null) t0 = t;
        if (!document.hidden) draw(0.6 + ((t - t0) / 1000) * 1.6);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- notes page filter ---------- */
  var fb = document.querySelectorAll('.filter button');
  if (fb.length) fb.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.concept').forEach(function (c) {
        c.hidden = f !== 'all' && c.getAttribute('data-area') !== f;
      });
    });
  });

  /* ---------- footer year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
