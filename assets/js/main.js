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
  var filters = document.querySelector('.filters');
  var ALL = 'הכול';

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function specRow(label, value) {
    var row = el('div');
    row.appendChild(el('dt', null, label));
    var dd = el('dd', value ? null : 'todo', value || 'למילוי');
    row.appendChild(dd);
    return row;
  }

  function card(item) {
    var li = el('li', 'card');

    var img = el('img');
    img.src = 'assets/img/' + item.image + '-800.webp';
    img.alt = item.alt || item.name;
    img.loading = 'lazy';
    img.width = 600;
    img.height = 750;
    var frame = el('div', 'card-photo');
    frame.appendChild(img);
    if (item.sample) frame.appendChild(el('span', 'card-sample todo', 'דוגמה'));
    li.appendChild(frame);

    var body = el('div', 'card-body');
    body.appendChild(el('p', 'card-cat', item.category));
    body.appendChild(el('h3', null, item.name));
    var dl = el('dl', 'card-spec');
    dl.appendChild(specRow('בד', item.fabric));
    dl.appendChild(specRow('מידות', item.size));
    dl.appendChild(specRow('צבעים', item.colors));
    body.appendChild(dl);
    li.appendChild(body);
    return li;
  }

  function render(category) {
    grid.textContent = '';
    items.forEach(function (item) {
      if (category === ALL || item.category === category) grid.appendChild(card(item));
    });
  }

  if (grid && filters && items.length) {
    var categories = [ALL];
    items.forEach(function (item) {
      if (categories.indexOf(item.category) === -1) categories.push(item.category);
    });
    categories.forEach(function (cat, i) {
      var btn = el('button', 'filter', cat);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.addEventListener('click', function () {
        filters.querySelectorAll('.filter').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        render(cat);
      });
      filters.appendChild(btn);
    });
    render(ALL);
  }

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
