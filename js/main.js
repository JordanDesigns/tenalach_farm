/* ==========================================================================
   Tenalach Farm
   Site behaviour: navigation, scroll reveal, gallery lightbox, forms.
   No dependencies. Everything degrades gracefully if JS is unavailable.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.getElementById("mobileNav");
    if (!toggle || !panel) return;

    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      panel.classList.add("is-open");
      panel.removeAttribute("inert");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("is-locked");
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }

    function close() {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("is-locked");
      // Wait for the fade out before removing it from the tab order
      window.setTimeout(function () {
        if (!panel.classList.contains("is-open")) panel.setAttribute("inert", "");
      }, 260);
      if (lastFocused) lastFocused.focus();
    }

    panel.setAttribute("inert", "");

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") close();
      else open();
    });

    // Tapping any link closes the overlay
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });

    // If the viewport grows past the desktop breakpoint, drop the overlay
    window.matchMedia("(min-width: 56em)").addEventListener("change", function (e) {
      if (e.matches && panel.classList.contains("is-open")) close();
    });
  }

  /* ------------------------------------------------------------------
     Header shadow once the page has scrolled
     ------------------------------------------------------------------ */

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Gallery lightbox
     Each gallery is independent. Buttons carry data-full and data-caption.
     ------------------------------------------------------------------ */

  function initLightbox() {
    var galleries = document.querySelectorAll("[data-gallery]");
    if (!galleries.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Close photo viewer">&#10005;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" src="" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
      '<p class="lightbox__count" aria-live="polite"></p>';
    document.body.appendChild(box);

    var imgEl = box.querySelector(".lightbox__img");
    var capEl = box.querySelector(".lightbox__caption");
    var countEl = box.querySelector(".lightbox__count");
    var prevBtn = box.querySelector(".lightbox__prev");
    var nextBtn = box.querySelector(".lightbox__next");
    var closeBtn = box.querySelector(".lightbox__close");

    var items = [];
    var index = 0;
    var opener = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var item = items[index];
      imgEl.src = item.full;
      imgEl.alt = item.alt;
      capEl.textContent = item.caption;
      capEl.style.display = item.caption ? "" : "none";
      countEl.textContent = (index + 1) + " of " + items.length;
      var multiple = items.length > 1;
      prevBtn.style.display = multiple ? "" : "none";
      nextBtn.style.display = multiple ? "" : "none";
      countEl.style.display = multiple ? "" : "none";
    }

    function open(list, i, trigger) {
      items = list;
      opener = trigger;
      show(i);
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      closeBtn.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      window.setTimeout(function () { imgEl.src = ""; }, 260);
      if (opener) opener.focus();
    }

    Array.prototype.forEach.call(galleries, function (gallery) {
      var triggers = gallery.querySelectorAll("[data-full]");

      var list = Array.prototype.map.call(triggers, function (t) {
        var img = t.querySelector("img");
        return {
          full: t.getAttribute("data-full"),
          alt: img ? img.alt : "",
          caption: t.getAttribute("data-caption") || ""
        };
      });

      Array.prototype.forEach.call(triggers, function (t, i) {
        t.addEventListener("click", function () { open(list, i, t); });
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(index - 1); });
    nextBtn.addEventListener("click", function () { show(index + 1); });

    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        // Keep focus inside the dialog
        var focusable = box.querySelectorAll("button:not([style*='display: none'])");
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Swipe between photos on touch devices
    var touchX = null;
    box.addEventListener("touchstart", function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });

    box.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) show(delta > 0 ? index - 1 : index + 1);
      touchX = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Forms

     Submissions post to a form relay service. Replace the endpoint in the
     form's action attribute with the real one before launch. Until then
     the form validates, then tells the visitor to email instead rather
     than silently swallowing the message.
     ------------------------------------------------------------------ */

  var PLACEHOLDER = "REPLACE_WITH_YOUR_FORM_ID";

  function initForms() {
    var forms = document.querySelectorAll("form[data-form]");
    if (!forms.length) return;

    Array.prototype.forEach.call(forms, function (form) {
      var status = form.querySelector(".form-status");
      var submit = form.querySelector("[type=submit]");

      // Live-clear an error as soon as the visitor fixes the field
      Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field");
          if (field && field.classList.contains("has-error") && input.checkValidity()) {
            field.classList.remove("has-error");
          }
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (status) status.classList.remove("is-visible", "form-status--ok", "form-status--fail");

        // Validate
        var firstBad = null;
        Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (input) {
          if (input.type === "hidden" || input.closest(".hp-field")) return;
          var field = input.closest(".field");
          if (!field) return;
          var ok = input.checkValidity();
          field.classList.toggle("has-error", !ok);
          if (!ok) {
            var msg = field.querySelector(".field-error");
            if (msg && !msg.dataset.custom) msg.textContent = input.validationMessage;
            if (!firstBad) firstBad = input;
          }
        });

        if (firstBad) {
          firstBad.focus();
          firstBad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          return;
        }

        // Honeypot: if a bot filled the hidden field, pretend it worked
        var hp = form.querySelector(".hp-field input");
        if (hp && hp.value) { showStatus(true); return; }

        var action = form.getAttribute("action") || "";

        if (!action || action.indexOf(PLACEHOLDER) !== -1) {
          // Not wired up yet. Be honest about it rather than losing the message.
          showStatus(false,
            "This form is not connected yet. Please email us directly at " +
            "TenalachFarm1@gmail.com and we will get right back to you.");
          return;
        }

        var original = submit ? submit.textContent : "";
        if (submit) { submit.disabled = true; submit.textContent = "Sending..."; }

        fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (res.ok) {
              form.reset();
              showStatus(true);
            } else {
              showStatus(false);
            }
          })
          .catch(function () { showStatus(false); })
          .then(function () {
            if (submit) { submit.disabled = false; submit.textContent = original; }
          });

        function showStatus(ok, customText) {
          if (!status) return;
          status.className = "form-status is-visible " + (ok ? "form-status--ok" : "form-status--fail");
          status.textContent = customText || (ok
            ? (form.getAttribute("data-success") ||
               "Thank you. Your message is on its way and we will reply as soon as we can.")
            : "Something went wrong sending your message. Please try again, or email us at TenalachFarm1@gmail.com.");
          status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Cabin enquiry: preselect a cabin, either from ?cabin= in the URL or
     from whichever "Enquire about this cabin" button was pressed.
     ------------------------------------------------------------------ */

  function initCabinPreselect() {
    var select = document.getElementById("cabin");
    if (!select) return;

    function choose(value) {
      if (!value) return;
      var match = Array.prototype.filter.call(select.options, function (opt) {
        return opt.value.toLowerCase() === value.toLowerCase();
      })[0];
      if (match) select.value = match.value;
    }

    choose(new URLSearchParams(window.location.search).get("cabin"));

    Array.prototype.forEach.call(document.querySelectorAll("[data-cabin]"), function (btn) {
      btn.addEventListener("click", function () {
        choose(btn.getAttribute("data-cabin"));
        // The browser handles the jump to #enquire; nudge focus once it lands
        window.setTimeout(function () { select.focus({ preventScroll: true }); }, 400);
      });
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */

  function initYear() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */

  function boot() {
    initNav();
    initHeader();
    initReveal();
    initLightbox();
    initForms();
    initCabinPreselect();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
