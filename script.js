/* ============================================================
   A-List Transportation — UI interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  /* ---- Sticky nav shadow on scroll ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated stat counters ---- */
  function animateCount(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^([\d,]+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''), 10);
    var suffix = match[2];
    var duration = 1400, startTime = null;
    function tick(now) {
      if (!startTime) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Quote form → emails submissions via FormSubmit ---- */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/alisttransportcincy@gmail.com';
  var form = document.getElementById('quoteForm');
  var success = document.getElementById('quoteSuccess');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var data = { _subject: 'New ride request — alisttransportcincy.com', _template: 'table' };
      form.querySelectorAll('input, select, textarea').forEach(function (f) { if (f.name) data[f.name] = f.value; });
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        form.querySelectorAll('input, select, textarea').forEach(function (f) { f.value = ''; });
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        alert('Something went wrong — please call 513-276-9949 or email alisttransportcincy@gmail.com');
      });
    });
  }

  /* ---- Newsletter forms → email via FormSubmit ---- */
  document.querySelectorAll('.footer__news').forEach(function (nf) {
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = nf.querySelector('input[type="email"]');
      var btn = nf.querySelector('button');
      if (!inp || !inp.value.trim()) { if (inp) inp.reportValidity(); return; }
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: inp.value.trim(), _subject: 'Newsletter signup — alisttransportcincy.com', _template: 'table' })
      }).then(function (r) { return r.json(); }).then(function () {
        if (btn) { btn.textContent = '✓ Subscribed'; }
        inp.value = '';
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Submit'; }
      });
    });
  });

  /* ---- Rider tabs (Students / Seniors / Parent Account) ---- */
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll('.tabs__btn'));
  var tabPanels = document.querySelectorAll('.tabs__panel');
  if (tabBtns.length) {
    var selectTab = function (btn) {
      tabBtns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      tabPanels.forEach(function (p) {
        var on = p.id === btn.getAttribute('aria-controls');
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
    };
    tabBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { selectTab(btn); });
      btn.addEventListener('keydown', function (e) {
        var idx = null;
        if (e.key === 'ArrowRight') idx = (i + 1) % tabBtns.length;
        else if (e.key === 'ArrowLeft') idx = (i - 1 + tabBtns.length) % tabBtns.length;
        if (idx !== null) { e.preventDefault(); tabBtns[idx].focus(); selectTab(tabBtns[idx]); }
      });
    });
  }

  /* ---- Parent account (demo: localStorage-backed) ---- */
  var paPage = document.getElementById('paPage');
  if (paPage) {
    var paAuth = document.getElementById('paAuth');
    var paDash = document.getElementById('paDash');
    var paTabLogin = document.getElementById('paTabLogin');
    var paTabSignup = document.getElementById('paTabSignup');
    var paNameFld = document.getElementById('paNameFld');
    var paForm = document.getElementById('paForm');
    var paMode = 'login';

    function paSetMode(m) {
      paMode = m;
      paTabLogin.classList.toggle('is-on', m === 'login');
      paTabSignup.classList.toggle('is-on', m === 'signup');
      paNameFld.style.display = m === 'signup' ? '' : 'none';
      document.getElementById('paSubmit').textContent = m === 'signup' ? 'Create account' : 'Log in';
    }
    paTabLogin.addEventListener('click', function () { paSetMode('login'); });
    paTabSignup.addEventListener('click', function () { paSetMode('signup'); });

    function paRender() {
      var u = localStorage.getItem('paUser');
      if (u) {
        paAuth.hidden = true;
        paDash.hidden = false;
        document.getElementById('paHello').textContent = u;
      } else {
        paAuth.hidden = false;
        paDash.hidden = true;
      }
    }
    paForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('paEmail').value.trim();
      var pass = document.getElementById('paPass').value;
      if (!email || !pass) { paForm.reportValidity(); return; }
      var name = document.getElementById('paName').value.trim();
      if (!name) name = email.split('@')[0].replace(/[._-]+/g, ' ');
      name = name.charAt(0).toUpperCase() + name.slice(1);
      localStorage.setItem('paUser', name);
      paRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('paLogout').addEventListener('click', function () {
      localStorage.removeItem('paUser');
      paRender();
    });
    paSetMode('login');
    paRender();
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
