/* ============================================================
   DNK KLINIKA — общий скрипт (все страницы)
   DNA-canvas · навигация · reveal · счётчики · видео · форма→WA
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA_PHONE = '77471740344';

  /* ---------------- Шапка: фон при скролле ---------------- */
  var header = document.querySelector('.header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- Бургер / мобильное меню ---------------- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-locked', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        mnav.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('menu-locked');
      }
    });
  }

  /* ---------------- Выпадающее «Услуги» (тач/клавиатура) ---------------- */
  var drop = document.querySelector('.nav__drop');
  if (drop) {
    var dropBtn = drop.querySelector('.nav__drop-btn');
    dropBtn.addEventListener('click', function (e) {
      e.preventDefault();
      drop.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) drop.classList.remove('is-open');
    });
  }

  /* ============================================================
     DNA HERO — вращающаяся двойная спираль (Canvas)
     ============================================================ */
  var canvas = document.getElementById('dnaCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var t = 0;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function drawHelix(time) {
      ctx.clearRect(0, 0, W, H);

      var mobile = W < 720;
      // спираль идёт по диагонали через экран
      var cx = mobile ? W * 0.5 : W * 0.66;   // ось X спирали
      var amp = mobile ? W * 0.30 : Math.min(W * 0.16, 210); // радиус витка
      var top = -40, bottom = H + 40;
      var steps = mobile ? 42 : 64;           // узлов на спираль
      var twist = 0.014;                      // плотность витков
      var speed = time * 0.00045;             // медленное вращение
      var pulse = 1 + Math.sin(time * 0.0012) * 0.06; // дыхание

      var i, y, phase, x1, x2, z1, z2;

      // перекладины
      for (i = 0; i <= steps; i++) {
        y = top + (bottom - top) * (i / steps);
        phase = y * twist + speed;
        x1 = cx + Math.sin(phase) * amp * pulse;
        x2 = cx + Math.sin(phase + Math.PI) * amp * pulse;
        z1 = Math.cos(phase);
        if (i % 2 === 0) {
          var g = ctx.createLinearGradient(x1, y, x2, y);
          g.addColorStop(0, 'rgba(35,183,204,' + (0.05 + 0.14 * Math.abs(z1)) + ')');
          g.addColorStop(0.5, 'rgba(94,224,242,' + (0.12 + 0.2 * Math.abs(z1)) + ')');
          g.addColorStop(1, 'rgba(35,183,204,' + (0.05 + 0.14 * Math.abs(z1)) + ')');
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      }

      // две нити: точки с глубиной (ближние — ярче и крупнее)
      for (i = 0; i <= steps; i++) {
        y = top + (bottom - top) * (i / steps);
        phase = y * twist + speed;

        x1 = cx + Math.sin(phase) * amp * pulse;
        z1 = (Math.cos(phase) + 1) / 2; // 0..1
        x2 = cx + Math.sin(phase + Math.PI) * amp * pulse;
        z2 = (Math.cos(phase + Math.PI) + 1) / 2;

        dot(x1, y, z1);
        dot(x2, y, z2);
      }

      function dot(x, y, z) {
        var r = 1.6 + z * 3.4;
        var a = 0.18 + z * 0.72;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(94,224,242,' + a.toFixed(3) + ')';
        ctx.shadowColor = 'rgba(31,169,190,.9)';
        ctx.shadowBlur = 4 + z * 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    if (REDUCED) {
      drawHelix(0); // статичный кадр
      window.addEventListener('resize', function () { resize(); drawHelix(0); });
    } else {
      var running = true;
      // не жечь CPU, когда hero вне экрана
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          running = en[0].isIntersecting;
        }, { threshold: 0 }).observe(canvas);
      }
      (function loop(now) {
        if (running) drawHelix(now || 0);
        requestAnimationFrame(loop);
      })(0);
    }
  }

  /* ---------------- Reveal при скролле ---------------- */
  var rvEls = document.querySelectorAll('.rv');
  if (rvEls.length && 'IntersectionObserver' in window && !REDUCED) {
    var rvIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          rvIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvEls.forEach(function (el) { rvIO.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- Счётчики ---------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (REDUCED) { el.textContent = target + suffix; return; }
      var dur = 1600, start = null;
      function tick(now) {
        if (!start) start = now;
        var p = Math.min((now - start) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * p) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var cIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); cIO.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cIO.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------------- Фоновые видео: play/pause по видимости ---------------- */
  var bgVideos = document.querySelectorAll('video[data-bg]');
  if (bgVideos.length) {
    if (REDUCED) {
      bgVideos.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
    } else if ('IntersectionObserver' in window) {
      var vIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            v.pause();
          }
        });
      }, { threshold: 0.15 });
      bgVideos.forEach(function (v) { vIO.observe(v); });
    }
  }

  /* ---------------- Лайтбокс для отзывов-скринов ---------------- */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.review-shot img').forEach(function (img) {
      img.parentElement.addEventListener('click', function () {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lb.classList.add('is-open');
        document.body.classList.add('menu-locked');
      });
    });
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.classList.remove('menu-locked');
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lightbox__close')) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }

  /* ============================================================
     Форма записи → WhatsApp
     ============================================================ */
  document.querySelectorAll('form[data-booking]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var phone = (form.querySelector('[name="phone"]') || {}).value || '';
      var service = (form.querySelector('[name="service"]') || {}).value || '';
      var comment = (form.querySelector('[name="comment"]') || {}).value || '';

      var lines = ['Здравствуйте! Хочу записаться в DNK KLINIKA.'];
      if (name) lines.push('Имя: ' + name.trim());
      if (phone) lines.push('Телефон: ' + phone.trim());
      if (service) lines.push('Услуга: ' + service.trim());
      if (comment) lines.push('Комментарий: ' + comment.trim());

      var url = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(lines.join('\n'));

      onLeadSubmit(form, service); // чистый хук (позже — gtag)

      window.open(url, '_blank', 'noopener');
      var card = form.closest('.form-card');
      if (card) card.classList.add('is-sent');
    });
  });

  /* ============================================================
     Чистые обработчики конверсий (позже сюда повесят gtag)
     ============================================================ */
  function onLeadSubmit(form, service) {
    /* gtag placeholder: событие "form_submit" */
  }
  function onPhoneClick(href) {
    /* gtag placeholder: событие "phone_click" */
  }
  function onWhatsAppClick(href) {
    /* gtag placeholder: событие "whatsapp_click" */
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.indexOf('tel:') === 0) onPhoneClick(href);
    else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) onWhatsAppClick(href);
  });

})();
