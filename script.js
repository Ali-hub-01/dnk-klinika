/* ДНК Клиника - интерактив лэндинга */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Шапка: тень при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i % 3) * 0.08 + "s");
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Счётчики в блоке доверия ---------- */
  var counters = document.querySelectorAll(".count");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (prefersReducedMotion) { el.textContent = target; return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- Лёгкий параллакс hero ---------- */
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !prefersReducedMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroImg.style.transform = "translateY(" + y * 0.18 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Карточки услуг: CTA -> форма с выбранной услугой ---------- */
  var serviceSelect = document.getElementById("fService");
  document.querySelectorAll(".card__cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var service = btn.getAttribute("data-service");
      if (service && serviceSelect) {
        for (var i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].value === service) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
      var form = document.getElementById("zayavka");
      if (form) form.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Предвыбор услуги по якорю из рекламы ---------- */
  var hashToService = {
    "gipergidroz": "Гипергидроз (ботулинотерапия)",
    "hirurg": "Пластическая хирургия",
    "ginekolog": "Гинекология / интимная эстетика",
    "cosm": "Косметология",
    "lipolit": "Липолитики",
    "niti": "Нитевая подтяжка",
    "polimol": "Полимолочная кислота"
  };
  var hash = window.location.hash.replace("#", "");
  if (hash && hashToService[hash] && serviceSelect) {
    serviceSelect.value = hashToService[hash];
  }

  /* ---------- Форма записи -> WhatsApp ---------- */
  var form = document.getElementById("bookingForm");
  var success = document.getElementById("formSuccess");
  var WA_NUMBER = "77471740344";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var service = form.service.value;
    var comment = form.comment.value.trim();

    var valid = true;
    [form.name, form.phone].forEach(function (field) {
      field.classList.remove("is-error");
      if (!field.value.trim()) {
        field.classList.add("is-error");
        valid = false;
      }
    });
    if (!valid) return;

    var lines = [
      "Здравствуйте! Хочу записаться на консультацию в ДНК Клинику.",
      "Имя: " + name,
      "Телефон: " + phone,
      "Услуга: " + service
    ];
    if (comment) lines.push("Комментарий: " + comment);

    var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");

    success.hidden = false;
    form.reset();
    setTimeout(function () { success.hidden = true; }, 8000);
  });

  /* ---------- Подсветка ошибки снимается при вводе ---------- */
  [form.name, form.phone].forEach(function (field) {
    field.addEventListener("input", function () {
      field.classList.remove("is-error");
    });
  });
})();
