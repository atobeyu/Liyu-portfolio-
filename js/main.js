/* LI YU Portfolio — Cosmos interactions */
(function () {
  'use strict';

  /* ---- starfield canvas ---- */
  function initStars() {
    var canvas = document.getElementById('stars');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, stars = [], shooters = [], mx = 0, my = 0;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function makeStar() {
      return { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.2, tw: Math.random() * 0.05 + 0.01, ph: Math.random() * Math.PI * 2, vy: Math.random() * 0.04 + 0.01, d: Math.random() * 0.7 + 0.3 };
    }
    function init() {
      resize();
      stars = [];
      var n = Math.min(240, Math.floor(W * H / 7200));
      for (var i = 0; i < n; i++) stars.push(makeStar());
    }
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX / W - 0.5;
      my = e.clientY / H - 0.5;
    }, { passive: true });
    var last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      if (t - last < 40) return;
      last = t;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.y += s.vy;
        if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
        var a = 0.35 + 0.55 * Math.abs(Math.sin(t / 900 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x + mx * 44 * s.d, s.y + my * 28 * s.d, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(215,232,255,' + a.toFixed(3) + ')';
        ctx.fill();
      }
      if (Math.random() < 0.03 && shooters.length < 3) {
        shooters.push({ x: Math.random() * W * 0.8 + W * 0.1, y: Math.random() * H * 0.3, vx: 7 + Math.random() * 5, vy: 3 + Math.random() * 2.5, life: 60 });
      }
      for (var si = shooters.length - 1; si >= 0; si--) {
        var sh = shooters[si];
        ctx.strokeStyle = 'rgba(160,225,255,' + (sh.life / 60 * 0.9).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        ctx.stroke();
        sh.x += sh.vx; sh.y += sh.vy; sh.life--;
        if (sh.life <= 0) shooters.splice(si, 1);
      }
    }
    init();
    window.addEventListener('resize', init);
    requestAnimationFrame(frame);
  }

  /* ---- cursor glow ---- */
  function initCursor() {
    var g = document.querySelector('.cursor-glow');
    if (!g) return;
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('has-cursor');
    }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      g.style.left = x + 'px'; g.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ---- scroll progress ---- */
  function initProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- reveal on scroll ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- count up numbers ---- */
  function initCounts() {
    var els = document.querySelectorAll('.count-up[data-target]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var target = parseInt(en.target.getAttribute('data-target'), 10) || 0;
        var suffix = en.target.getAttribute('data-suffix') || '';
        var dur = 1300, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          en.target.textContent = Math.round(target * ease) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- AI galaxy orbit ---- */
  function initOrbit() {
    var nodes = document.querySelectorAll('.ai-node');
    var orbit = document.querySelector('.ai-orbit');
    if (!nodes.length || !orbit) return;
    function pos() {
      var r = orbit.getBoundingClientRect();
      var cx = r.width / 2, cy = r.height / 2;
      nodes.forEach(function (n, i) {
        var angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        var radius = r.width * (i % 2 === 0 ? 0.40 : 0.30);
        n.style.left = (cx + Math.cos(angle) * radius) + 'px';
        n.style.top = (cy + Math.sin(angle) * radius) + 'px';
      });
    }
    pos();
    window.addEventListener('resize', pos);
    nodes.forEach(function (n) {
      n.addEventListener('click', function () {
        nodes.forEach(function (o) { o.classList.remove('active'); });
        n.classList.add('active');
      });
    });
  }


  /* ---- generic galaxy: planets orbit + click -> description ---- */
  function initGalaxies() {
    var gals = document.querySelectorAll('.galaxy');
    if (!gals.length) return;
    gals.forEach(function (gal) {
      var orbits = gal.querySelectorAll('.porbit');
      var wrap = gal.closest('.galaxy-wrap');
      var gdesc = wrap ? wrap.querySelector('.gdesc') : null;
      if (!gdesc) return;
      function pos() {
        var r = gal.getBoundingClientRect();
        if (!r.width) return;
        var n = orbits.length;
        var base = 60;
        orbits.forEach(function (po, i) {
          var rad = r.width * (i % 2 === 0 ? 0.40 : 0.30);
          var dur = base + i * 5;
          po.style.setProperty('--r', rad + 'px');
          po.style.setProperty('--dur', dur + 's');
          po.style.setProperty('--del', (-(i / n) * dur) + 's');
        });
      }
      pos();
      window.addEventListener('resize', pos);
      gdesc.innerHTML = '<div class="gdesc-empty">👆 点击任意行星 · 查看对应内容</div>';
      orbits.forEach(function (po) {
        var node = po.querySelector('.planet');
        if (!node) return;
        node.addEventListener('click', function () {
          orbits.forEach(function (o) {
            var n2 = o.querySelector('.planet');
            if (n2) n2.classList.remove('active');
          });
          node.classList.add('active');
          var tag = node.getAttribute('data-tag') || '';
          var title = node.getAttribute('data-title') || '';
          var text = node.getAttribute('data-text') || '';
          var url = node.getAttribute('data-url') || '';
          var demo = node.getAttribute('data-demo') || '';
          var note = node.getAttribute('data-note') || '';
          var ll = node.getAttribute('data-ll') || '';
          var html = '<div class="gd-tag">' + tag + '</div><div class="gd-title">' + title + '</div><div class="gd-text">' + text + '</div>';
          if (url) html += '<a class="gd-link" href="' + url + '"' + (ll ? ' target="_blank" rel="noopener"' : '') + '>' + (ll || '项目详情 →') + '</a>';
          if (demo) html += ' <a class="btn btn-primary gd-demo" href="' + demo + '" target="_blank" rel="noopener">体验产品 ↗</a><span class="gd-note">' + note + '</span>';
          gdesc.innerHTML = html;
        });
      });
    });
  }

  /* ---- explore rotator ---- */
  function initExplore() {
    var phs = document.querySelectorAll('.ph');
    var next = document.getElementById('exploreNext');
    if (!phs.length) return;
    var cur = 0;
    var timer = null;
    function show(i) {
      cur = (i + phs.length) % phs.length;
      phs.forEach(function (p, idx) { p.classList.toggle('on', idx === cur); });
    }
    function advance() {
      show(cur + 1);
      if (timer) { clearInterval(timer); timer = null; }
      timer = setInterval(function () { show(cur + 1); }, 4200);
    }
    show(0);
    timer = setInterval(function () { show(cur + 1); }, 4200);
    if (next) next.addEventListener('click', advance);
    phs.forEach(function (p) {
      p.addEventListener('click', function () {
        var href = p.getAttribute('data-href');
        if (href && href.charAt(0) === '#') {
          var target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---- bg-name parallax ---- */
  function initBgName() {
    var bg = document.querySelector('.bg-name');
    if (!bg) return;
    var y = 0;
    window.addEventListener('scroll', function () {
      y = window.pageYOffset || document.documentElement.scrollTop;
      bg.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }, { passive: true });
  }

  /* ---- experience toggle ---- */
  function initExp() {
    document.querySelectorAll('.exp-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.exp-item');
        item.classList.toggle('open');
      });
    });
  }

  /* ---- mobile nav ---- */
  function initNav() {
    var t = document.querySelector('.nav-toggle');
    var l = document.querySelector('.nav-links');
    if (!t || !l) return;
    t.addEventListener('click', function () {
      l.classList.toggle('open');
      t.classList.toggle('open');
    });
    l.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        l.classList.remove('open');
        t.classList.remove('open');
      }
    });
  }

  /* ---- works filter ---- */
  function initFilter() {
    var btns = document.querySelectorAll('.filter-btn');
    var items = document.querySelectorAll('.work-item');
    if (!btns.length || !items.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        items.forEach(function (it) {
          var show = (cat === 'all') || (it.getAttribute('data-cat') === cat);
          it.style.display = show ? '' : 'none';
        });
      });
    });
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    if (cat) {
      var target = document.querySelector('.filter-btn[data-filter="' + cat + '"]');
      if (target) target.click();
    }
  }

  /* ---- 3D tilt on work cards ---- */
  function initTilt() {
    var cards = document.querySelectorAll('.work-card, .tilt');
    if (!cards.length || window.matchMedia('(hover: none)').matches) return;
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (px * 8).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg) translateY(-8px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---- lightbox ---- */
  function initLightbox() {
    var lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    var lbImg = lightbox.querySelector('.lb-img');
    var lbCount = lightbox.querySelector('.lb-count');
    var lbPrev = lightbox.querySelector('.lb-prev');
    var lbNext = lightbox.querySelector('.lb-next');
    var lbClose = lightbox.querySelector('.lb-close');
    var items = Array.prototype.slice.call(document.querySelectorAll('.g-item img'));
    var current = 0;
    function show(i) {
      current = (i + items.length) % items.length;
      var src = items[current].getAttribute('data-full') || items[current].getAttribute('src');
      lbImg.setAttribute('src', src);
      if (lbCount) lbCount.textContent = (current + 1) + ' / ' + items.length;
    }
    function open(i) { show(i); lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
    items.forEach(function (img, i) {
      img.addEventListener('click', function () { open(i); });
    });
    if (lbClose) lbClose.addEventListener('click', close);
    if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }


  /* ---- hero works carousel ---- */
  function initCarousel() {
    var car = document.querySelector('.hero-carousel');
    if (!car) return;
    var items = car.querySelectorAll('.hc-item');
    var dots = car.querySelectorAll('.hc-dot');
    var prev = car.querySelector('.hc-prev');
    var next = car.querySelector('.hc-next');
    if (!items.length) return;
    var cur = 0, timer = null;
    function show(i) {
      cur = (i + items.length) % items.length;
      items.forEach(function (it, idx) { it.classList.toggle('on', idx === cur); });
      dots.forEach(function (d, idx) { d.classList.toggle('on', idx === cur); });
    }
    function auto() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { show(cur + 1); }, 4200);
    }
    auto();
    car.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    car.addEventListener('mouseleave', auto);
    if (prev) prev.addEventListener('click', function () { show(cur - 1); auto(); });
    if (next) next.addEventListener('click', function () { show(cur + 1); auto(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(parseInt(d.getAttribute('data-idx'), 10) || 0); auto(); });
    });
  }

  /* ---- boot ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initStars();
    initCursor();
    initProgress();
    initReveal();
    initCounts();
    initGalaxies();
    initCarousel();
    initExplore();
    initBgName();
    initExp();
    initNav();
    initFilter();
    initTilt();
    initLightbox();
  });
})();
