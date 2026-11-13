(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- כותרת עליונה: רקע לבן אחרי שעוברים את הפתיחה ---------- */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-solid', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  /* כפתור הוואטסאפ הצף מוסתר כל עוד הפתיחה ממלאת את המסך (שם כבר יש קריאה לפעולה אחרת) */
  document.addEventListener('DOMContentLoaded', function () {
    var waFab = document.querySelector('.wa-fab');
    if (waFab && hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        waFab.classList.toggle('is-hidden', entries[0].intersectionRatio > 0.35);
      }, { threshold: [0, 0.35, 1] }).observe(hero);
    }
  });

  /* ---------- תפריט במובייל ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ---------- קטלוג ---------- */
  var items = window.CATALOG || [];
  var grid = document.querySelector('.catalog-grid');
  var rtl = document.documentElement.dir === 'rtl';

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function imgSrc(file, w) {
    return 'assets/img/catalog/' + file + '-' + w + '.webp';
  }

  /* גלריה: גוללים או לוחצים על החצים. הגלילה עצמה עושה את העבודה, והחצים רק מזיזים אותה. */
  function slider(item) {
    var wrap = el('div', 'slider');

    var track = el('div', 'slides');
    track.tabIndex = 0;
    track.setAttribute('role', 'group');
    track.setAttribute('aria-roledescription', 'גלריית תמונות');
    track.setAttribute('aria-label', 'תמונות של ' + item.name);
    item.images.forEach(function (im, i) {
      var slide = el('div', 'slide');
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'תמונה');
      slide.setAttribute('aria-label', (i + 1) + ' מתוך ' + item.images.length);
      var img = el('img');
      img.src = imgSrc(im.file, 640);
      img.srcset = imgSrc(im.file, 640) + ' 640w, ' + imgSrc(im.file, 1100) + ' 1100w';
      img.sizes = '(min-width: 960px) 30vw, (min-width: 600px) 45vw, 92vw';
      img.alt = im.alt || item.name;
      img.width = 640;
      img.height = 640;
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });
    wrap.appendChild(track);

    if (item.images.length < 2) return wrap;

    var prev = el('button', 'slider-btn slider-prev');
    var next = el('button', 'slider-btn slider-next');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'התמונה הקודמת');
    next.setAttribute('aria-label', 'התמונה הבאה');
    var count = el('p', 'slider-count');
    count.setAttribute('aria-live', 'polite');
    wrap.appendChild(prev);
    wrap.appendChild(next);
    wrap.appendChild(count);

    function index() {
      var w = track.clientWidth;
      return w ? Math.round(Math.abs(track.scrollLeft) / w) : 0;
    }
    function update() {
      var i = Math.min(item.images.length - 1, Math.max(0, index()));
      count.textContent = (i + 1) + ' / ' + item.images.length;
      prev.disabled = i === 0;
      next.disabled = i === item.images.length - 1;
    }
    function go(step) {
      var target = Math.min(item.images.length - 1, Math.max(0, index() + step));
      track.scrollTo({
        left: (rtl ? -1 : 1) * target * track.clientWidth,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    var frame = 0;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
    return wrap;
  }

  function card(item) {
    var li = el('li', 'card');
    li.appendChild(slider(item));
    var body = el('div', 'card-body');
    body.appendChild(el('h3', null, item.name));
    if (item.description) body.appendChild(el('p', 'card-desc', item.description));
    if (item.specs && item.specs.length) {
      var dl = el('dl', 'card-spec');
      item.specs.forEach(function (row) {
        var r = el('div');
        r.appendChild(el('dt', null, row[0]));
        r.appendChild(el('dd', null, row[1]));
        dl.appendChild(r);
      });
      body.appendChild(dl);
    }
    li.appendChild(body);
    return li;
  }

  if (grid) items.forEach(function (item) { grid.appendChild(card(item)); });

  /* ---------- חשיפה בגלילה ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (n) { n.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (n) { io.observe(n); });
  }
})();
