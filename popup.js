/* Chelsea's Rentals – Scooter Finder pop-out
   Opens the finder in an overlay on top of the current page, so visitors never leave the site.
   Install once:  Booqable.loadScript('https://YOUR-FINDER-ADDRESS/popup.js');
   Triggers:
     - any link to the finder address, or to "#find-my-scooter", opens the overlay
     - visiting a page with #find-my-scooter in the address opens it automatically
     - a floating "Find my scooter" button on mobility pages (see FLOATING below)
*/
(function () {
  if (window.__crFinderLoaded) return;
  window.__crFinderLoaded = true;

  var me = document.currentScript || document.querySelector('script[src*="popup.js"]');
  var BASE = me && me.src ? me.src.replace(/popup\.js.*$/, "") : "";
  var FINDER = BASE + "index.html";
  var ORIGIN = BASE ? new URL(BASE).origin : "";

  // Which pages show the floating button: "mobility" (default), "all" or "none".
  var cfg = window.CR_FINDER || {};
  var FLOATING = cfg.floating || "mobility";
  var MOBILITY = /scooter|mobility|wheelchair|ultralight|lightweight|heavyweight/i;

  var css =
    ".crf-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147483000;display:flex;align-items:center;gap:8px;" +
    "background:#2D235C;color:#fff;border:0;border-radius:999px;padding:13px 18px;font:600 15px/1 system-ui,-apple-system,'Segoe UI',sans-serif;" +
    "box-shadow:0 8px 24px rgba(45,35,92,.35);cursor:pointer}" +
    ".crf-fab:hover{background:#43368a}.crf-fab svg{width:18px;height:18px}" +
    ".crf-back{position:fixed;inset:0;z-index:2147483600;background:rgba(20,16,40,.55);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}" +
    ".crf-back.on{opacity:1}" +
    ".crf-box{position:relative;width:min(680px,100%);height:min(860px,92vh);background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);transform:translateY(12px);transition:transform .2s}" +
    ".crf-back.on .crf-box{transform:none}" +
    ".crf-box iframe{width:100%;height:100%;border:0;display:block}" +
    ".crf-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.9);cursor:pointer;font:20px/1 system-ui;color:#2D235C;display:none}" +
    ".crf-loading .crf-x{display:block}" +
    "@media (max-width:640px){.crf-back{align-items:stretch}.crf-box{width:100%;height:100%;border-radius:0}}" +
    "html.crf-lock,html.crf-lock body{overflow:hidden!important}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var back = null, lastFocus = null;

  function open() {
    if (back) return;
    lastFocus = document.activeElement;
    back = document.createElement("div");
    back.className = "crf-back crf-loading";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-label", "Scooter finder");
    back.innerHTML =
      '<div class="crf-box"><button class="crf-x" type="button" aria-label="Close">×</button>' +
      '<iframe title="Which mobility scooter should I hire?" src="' + FINDER + '?embed=1&start=1" allow="clipboard-write"></iframe></div>';
    document.body.appendChild(back);
    document.documentElement.classList.add("crf-lock");
    var frame = back.querySelector("iframe");
    frame.addEventListener("load", function () { back && back.classList.remove("crf-loading"); frame.focus(); });
    back.querySelector(".crf-x").onclick = close;
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    requestAnimationFrame(function () { back.classList.add("on"); });
    track("scooter_finder_open", {});
  }

  function close() {
    if (!back) return;
    var b = back;
    back = null;
    b.classList.remove("on");
    document.documentElement.classList.remove("crf-lock");
    setTimeout(function () { b.remove(); }, 200);
    if (location.hash === "#find-my-scooter") history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function track(name, params) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params);
      else if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params));
    } catch (e) {}
  }

  window.addEventListener("message", function (e) {
    if (ORIGIN && e.origin !== ORIGIN) return;
    var d = e.data || {};
    if (d.source !== "cr-scooter-finder") return;
    if (d.type === "close") close();
    if (d.type === "result") track("scooter_finder_result", { scooter: d.scooter, exact_match: d.exact });
    if (d.type === "book") track("scooter_finder_book_click", { scooter: d.scooter });
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  // Turn any link to the finder (or to #find-my-scooter) into a pop-out trigger.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var isFinder = href.indexOf("#find-my-scooter") > -1 || (BASE && a.href.indexOf(BASE) === 0);
    if (!isFinder || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open();
  }, true);

  function addFab() {
    if (FLOATING === "none") return;
    if (FLOATING === "mobility" && !MOBILITY.test(location.pathname)) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "crf-fab";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>Find my scooter';
    b.onclick = open;
    document.body.appendChild(b);
  }

  function ready(fn) { document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn(); }
  ready(function () {
    addFab();
    if (location.hash === "#find-my-scooter") open();
  });
  window.addEventListener("hashchange", function () { if (location.hash === "#find-my-scooter") open(); });

  window.CRScooterFinder = { open: open, close: close };
})();
