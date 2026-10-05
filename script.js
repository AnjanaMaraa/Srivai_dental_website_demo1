/* ==========================================================================
   DIGIMARAA DENTAL CLINIC — script.js
   Vanilla JS, no dependencies. Edit the CLINIC object to change the
   phone number, WhatsApp link or default enquiry message.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. CLINIC SETTINGS  (edit here)
     ------------------------------------------------------------------ */
  var CLINIC = {
    phoneDisplay: '+91 72002 51560',
    phoneDial: '+917200251560',          // used for tel: links
    whatsapp: 'https://wa.me/917200251560', // used for wa.me links
    defaultMessage: 'Hi DigiMaraa Dental Clinic, I would like to book a dental consultation.'
  };

  /* Reusable WhatsApp link builder. */
  function waLink(message) {
    return CLINIC.whatsapp + '?text=' + encodeURIComponent(message || CLINIC.defaultMessage);
  }

  /* Fill every [data-wa-msg] link with a ready-to-use WhatsApp URL.
     Links already have a plain wa.me href in the HTML, so they keep
     working even with JavaScript disabled. */
  function initWhatsAppLinks() {
    var links = document.querySelectorAll('[data-wa-msg]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = waLink(links[i].getAttribute('data-wa-msg'));
    }
  }

  /* ------------------------------------------------------------------
     2. HEADER — solid background once the page is scrolled
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.pageYOffset > 24);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. MOBILE NAVIGATION DRAWER
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');
    var scrim = document.getElementById('navScrim');
    if (!toggle || !nav) return;

    function isOpen() { return document.body.classList.contains('nav-open'); }

    function setNav(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (scrim) scrim.hidden = !open;
      if (open) {
        var first = nav.querySelector('a, button');
        if (first) first.focus();
      }
    }

    toggle.addEventListener('click', function () { setNav(!isOpen()); });
    if (scrim) scrim.addEventListener('click', function () { setNav(false); });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setNav(false); toggle.focus(); }
    });

    /* Close the drawer if the viewport grows into desktop layout. */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && isOpen()) setNav(false);
    });
  }

  /* ------------------------------------------------------------------
     4. SCROLL REVEAL
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ------------------------------------------------------------------
     5. ACTIVE NAV LINK HIGHLIGHT
     ------------------------------------------------------------------ */
  function initActiveLink() {
    var links = document.querySelectorAll('.nav-link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var section = document.querySelector(id);
      if (section) map[id.slice(1)] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ------------------------------------------------------------------
     6. FAQ ACCORDION
     ------------------------------------------------------------------ */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    function panelOf(item) { return item.querySelector('.faq-answer'); }
    function buttonOf(item) { return item.querySelector('.faq-question'); }

    function open(item) {
      var btn = buttonOf(item);
      var panel = panelOf(item);
      panel.hidden = false;
      panel.style.maxHeight = '0px';
      void panel.offsetHeight;            /* force reflow so the height animates */
      panel.style.maxHeight = panel.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');
    }

    function close(item) {
      var btn = buttonOf(item);
      var panel = panelOf(item);
      panel.style.maxHeight = panel.scrollHeight + 'px';
      void panel.offsetHeight;            /* force reflow so the height animates */
      panel.style.maxHeight = '0px';
      btn.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');

      function finish() {
        /* guard: don't hide a panel that was re-opened while animating */
        if (btn.getAttribute('aria-expanded') === 'true') return;
        panel.hidden = true;
        panel.removeEventListener('transitionend', onEnd);
        clearTimeout(timer);
      }
      function onEnd(e) {
        if (e.propertyName === 'max-height') finish();
      }
      panel.addEventListener('transitionend', onEnd);
      var timer = setTimeout(finish, 420);  /* fallback if animations are off */
    }

    function toggle(item) {
      var btn = buttonOf(item);
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      items.forEach(function (other) {
        if (other !== item && other.classList.contains('is-open')) close(other);
      });
      if (isOpen) close(item); else open(item);
    }

    items.forEach(function (item) {
      buttonOf(item).addEventListener('click', function () { toggle(item); });
    });

    /* Keep open panels correctly sized when the text reflows. */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        items.forEach(function (item) {
          if (!item.classList.contains('is-open')) return;
          var panel = panelOf(item);
          panel.style.maxHeight = 'none';
          var h = panel.scrollHeight;
          panel.style.maxHeight = h + 'px';
        });
      }, 150);
    });

    open(items[0]);   /* start with the first question open */
  }

  /* ------------------------------------------------------------------
     7. REVIEW CAROUSEL — only make it keyboard-scrollable on mobile
     ------------------------------------------------------------------ */
  function initReviewTrack() {
    var track = document.getElementById('testimonialTrack');
    if (!track) return;

    function sync() {
      var scrollable = track.scrollWidth - track.clientWidth > 4;
      if (scrollable) {
        track.tabIndex = 0;   /* keyboard users can scroll the row */
      } else {
        track.removeAttribute('tabindex');
      }
    }
    sync();
    window.addEventListener('resize', debounce(sync, 150));
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  /* ------------------------------------------------------------------
     8. MOBILE BOTTOM BAR — hide once the footer's own CTA is on screen
     ------------------------------------------------------------------ */
  function initMobileBar() {
    var bar = document.getElementById('mobileCta');
    var target = document.querySelector('.footer-cta-col');
    if (!bar || !target || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.style.display = entry.isIntersecting ? 'none' : '';
      });
    }, { threshold: 0.6 });
    io.observe(target);
  }

  /* ------------------------------------------------------------------
     9. FOOTER YEAR
     ------------------------------------------------------------------ */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------ */
  function init() {
    initWhatsAppLinks();
    initHeader();
    initMobileNav();
    initReveal();
    initActiveLink();
    initFaq();
    initReviewTrack();
    initMobileBar();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose the helper so extra buttons can be added from the console. */
  window.DigiMaraaDental = { waLink: waLink, clinic: CLINIC };
})();
