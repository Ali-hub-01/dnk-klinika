/* DNK KLINIKA, промо-попап с акциями. Читает window.DNK_OFFERS. */
(function () {
  'use strict';

  var offers = window.DNK_OFFERS;
  if (!Array.isArray(offers) || !offers.length) return;

  var WA_PHONE = '77056763067';
  var SS_KEY = 'dnkPromoShown';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3.2-.5s0-.4 0-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a2.9 2.9 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function waLink(title) {
    var text = 'Здравствуйте! Хочу записаться по акции: ' + title + '. Подскажите, пожалуйста, детали.';
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
  }

  function offerHtml(o) {
    var html = '<article class="promo-offer">';
    if (o.badge) html += '<span class="promo-offer__badge">' + esc(o.badge) + '</span>';
    html += '<h3 class="promo-offer__title">' + esc(o.title) + '</h3>';
    if (o.desc) html += '<p class="promo-offer__desc">' + esc(o.desc) + '</p>';
    if (o.oldPrice || o.newPrice) {
      html += '<div class="promo-offer__prices">';
      if (o.oldPrice) html += '<s class="promo-offer__old">' + esc(o.oldPrice) + '</s>';
      if (o.newPrice) html += '<span class="promo-offer__new">' + esc(o.newPrice) + '</span>';
      html += '</div>';
    }
    html += '<div class="promo-offer__cta">';
    html += '<a class="promo-offer__wa" href="' + waLink(o.title) + '" target="_blank" rel="noopener">' + WA_ICON + 'Записаться</a>';
    if (o.anchor) html += '<button type="button" class="promo-offer__more" data-anchor="' + esc(o.anchor) + '">Подробнее</button>';
    html += '</div></article>';
    return html;
  }

  /* разметка попапа */
  var ovl = document.createElement('div');
  ovl.className = 'promo-ovl';
  ovl.setAttribute('aria-hidden', 'true');
  ovl.innerHTML =
    '<div class="promo" role="dialog" aria-modal="true" aria-label="Специальные предложения клиники" tabindex="-1">' +
      '<span class="promo__glow"></span>' +
      '<button type="button" class="promo__close" aria-label="Закрыть окно акций">&#10005;</button>' +
      '<div class="promo__head">' +
        '<span class="promo__eyebrow">Только сейчас</span>' +
        '<h2 class="promo__title">Успейте по акции</h2>' +
        '<p class="promo__sub">Напишите нам в WhatsApp, ответим за пару минут и подберём удобное время.</p>' +
      '</div>' +
      '<div class="promo__list">' + offers.map(offerHtml).join('') + '</div>' +
      '<p class="promo__foot">Количество мест по акции ограничено. DNK KLINIKA, Астана.</p>' +
    '</div>';

  /* плавающая кнопка повторного открытия */
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'promo-fab';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = '<span class="promo-fab__ico" aria-hidden="true">🎁</span><span>Акции</span>';

  document.body.appendChild(ovl);
  document.body.appendChild(fab);

  var dialog = ovl.querySelector('.promo');
  var lastFocus = null;
  var isOpen = false;

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    ovl.classList.add('is-open');
    ovl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-locked');
    dialog.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    ovl.classList.remove('is-open');
    ovl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    else fab.focus({ preventScroll: true });
  }

  fab.addEventListener('click', open);
  ovl.querySelector('.promo__close').addEventListener('click', close);
  ovl.addEventListener('click', function (e) { if (e.target === ovl) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) close();
  });

  /* «Подробнее»: закрыть и плавно проскроллить к якорю */
  ovl.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.promo-offer__more') : null;
    if (!btn) return;
    var target = document.querySelector(btn.getAttribute('data-anchor'));
    close();
    if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });

  /* авто-открытие 1 раз за сессию */
  var shown = false;
  try { shown = sessionStorage.getItem(SS_KEY) === '1'; } catch (err) {}
  if (!shown) {
    try { sessionStorage.setItem(SS_KEY, '1'); } catch (err) {}
    window.setTimeout(open, reducedMotion ? 400 : 2500);
  }
})();
