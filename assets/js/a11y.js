/*
  תפריט נגישות של האתר: כפתור עגול בפינת המסך שפותח חלון עם התאמות תצוגה.
  הכול רץ בדפדפן של הגולש. הבחירות נשמרות במכשיר שלו בלבד (localStorage) ולא נשלחות לשום מקום.
*/
(function () {
  'use strict';

  var KEY = 'bb-a11y';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.hero-media');

  var defaults = { text: 0, line: false, font: false, contrast: false, gray: false, noimg: false, still: false, links: false, mask: false, cursor: false };
  var state = JSON.parse(JSON.stringify(defaults));

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.keys(state).forEach(function (k) {
      if (k in saved && typeof saved[k] === typeof state[k]) state[k] = saved[k];
    });
  } catch (e) { /* אין אחסון מקומי: התפריט עדיין עובד, רק לא זוכר */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var GROUPS = [
    { title: 'טקסט', items: [
      { key: 'text', label: 'טקסט גדול יותר' },
      { key: 'line', label: 'גובה שורה' },
      { key: 'font', label: 'גופן קריא' }
    ] },
    { title: 'תצוגה', items: [
      { key: 'contrast', label: 'ניגודיות גבוהה' },
      { key: 'gray', label: 'גווני אפור' },
      { key: 'noimg', label: 'הסתרת תמונות' },
      { key: 'still', label: 'השהיית אנימציות' }
    ] },
    { title: 'ניווט', items: [
      { key: 'links', label: 'הדגשת קישורים' },
      { key: 'mask', label: 'מסכת קריאה' },
      { key: 'cursor', label: 'סמן גדול' }
    ] }
  ];

  var ICON = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.1" r="1.4" fill="currentColor" stroke="none"/>' +
    '<path d="M7 10.2c3.2 1 7.8 1 10 0M12 10.6v3.6M12 14.2l-2.6 4.4M12 14.2l2.6 4.4"/></svg>';

  /* ---------- בניית הכפתור והחלון ---------- */
  var fab = el('button', 'a11y-fab');
  fab.type = 'button';
  fab.setAttribute('aria-label', 'תפריט נגישות');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'a11y-panel');
  fab.innerHTML = ICON;

  var panel = el('div', 'a11y-panel');
  panel.id = 'a11y-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'תפריט נגישות');

  var head = el('div', 'a11y-head');
  head.appendChild(el('h2', null, 'נגישות'));
  var resetBtn = el('button', 'a11y-small', 'איפוס');
  resetBtn.type = 'button';
  var closeBtn = el('button', 'a11y-small', 'סגירה');
  closeBtn.type = 'button';
  head.appendChild(resetBtn);
  head.appendChild(closeBtn);
  panel.appendChild(head);

  var buttons = {};
  GROUPS.forEach(function (g) {
    var group = el('div', 'a11y-group');
    group.appendChild(el('h3', null, g.title));
    var grid = el('div', 'a11y-grid');
    g.items.forEach(function (it) {
      var b = el('button', 'a11y-opt', it.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        if (it.key === 'text') state.text = (state.text + 1) % 4;
        else state[it.key] = !state[it.key];
        save();
        apply();
      });
      buttons[it.key] = { node: b, label: it.label };
      grid.appendChild(b);
    });
    group.appendChild(grid);
    panel.appendChild(group);
  });

  var foot = el('p', 'a11y-foot');
  var statement = el('a', null, 'הצהרת נגישות');
  statement.href = 'accessibility.html';
  foot.appendChild(statement);
  panel.appendChild(foot);

  var maskTop = el('div', 'a11y-mask a11y-mask-top');
  var maskBottom = el('div', 'a11y-mask a11y-mask-bottom');
  maskTop.hidden = maskBottom.hidden = true;

  document.body.appendChild(maskTop);
  document.body.appendChild(maskBottom);
  document.body.appendChild(panel);
  document.body.appendChild(fab);

  /* ---------- פתיחה וסגירה ---------- */
  function setOpen(open, returnFocus) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) closeBtn.focus();
    else if (returnFocus) fab.focus();
  }
  fab.addEventListener('click', function () { setOpen(panel.hidden, true); });
  closeBtn.addEventListener('click', function () { setOpen(false, true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false, true);
  });
  resetBtn.addEventListener('click', function () {
    state = JSON.parse(JSON.stringify(defaults));
    save();
    apply();
  });

  /* ---------- מסכת קריאה ---------- */
  var BAND = 60;
  function moveMask(y) {
    maskTop.style.height = Math.max(0, y - BAND) + 'px';
    maskBottom.style.top = (y + BAND) + 'px';
  }
  document.addEventListener('pointermove', function (e) {
    if (state.mask) moveMask(e.clientY);
  }, { passive: true });
  document.addEventListener('focusin', function (e) {
    if (!state.mask || !e.target.getBoundingClientRect) return;
    var r = e.target.getBoundingClientRect();
    moveMask(r.top + r.height / 2);
  });

  /* ---------- החלת ההגדרות על הדף ---------- */
  function apply() {
    root.classList.remove('a11y-text-1', 'a11y-text-2', 'a11y-text-3');
    if (state.text) root.classList.add('a11y-text-' + state.text);
    ['line', 'font', 'contrast', 'gray', 'noimg', 'still', 'links', 'cursor'].forEach(function (k) {
      root.classList.toggle('a11y-' + k, !!state[k]);
    });

    if (video) {
      if (state.still || reduceMotion) video.pause();
      else if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    }

    maskTop.hidden = maskBottom.hidden = !state.mask;
    if (state.mask) moveMask(window.innerHeight / 2);

    Object.keys(buttons).forEach(function (k) {
      var b = buttons[k];
      var on = k === 'text' ? state.text > 0 : !!state[k];
      b.node.setAttribute('aria-pressed', String(on));
      b.node.textContent = k === 'text' && state.text ? b.label + ' (' + state.text + '/3)' : b.label;
    });
  }

  apply();
})();
