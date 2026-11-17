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

  /* ---------- hero figure: damped plane wave, slowly travelling ---------- */
  var ew = document.getElementById('ewave');
  if (ew) {
    var hw = document.getElementById('hwave'), g = document.getElementById('estems'), ns = 'http://www.w3.org/2000/svg';
    var x0 = 20, x1 = 400, y0 = 125, A = 72, n = 160, k = 2 * Math.PI / 150, a = 0.0016, stems = [];
    for (var z = 0; z <= 380; z += 12.5) {
      var l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', x0 + z); l.setAttribute('x2', x0 + z); l.setAttribute('y1', y0);
      g.appendChild(l); stems.push([l, z]);
    }
    var draw = function (ph) {
      function path(scale, skew) {
        var d = '';
        for (var i = 0; i <= n; i++) {
          var x = x0 + (x1 - x0) * i / n, zz = x - x0, v = A * Math.exp(-a * zz) * Math.cos(k * zz - ph);
          d += (i ? 'L' : 'M') + (x + skew * v).toFixed(1) + ' ' + (y0 - scale * v).toFixed(1);
        }
        return d;
      }
      ew.setAttribute('d', path(1, 0));
      hw.setAttribute('d', path(-0.42, 0.42));
      stems.forEach(function (s) { s[0].setAttribute('y2', (y0 - A * Math.exp(-a * s[1]) * Math.cos(k * s[1] - ph)).toFixed(1)); });
    };
    draw(0);
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still) {
      var t0 = null;
      var tick = function (t) {
        if (t0 === null) t0 = t;
        if (!document.hidden) draw(((t - t0) / 1000) * 1.1);
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
