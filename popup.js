/* Chelsea's Rentals \u2013 Finder pop-outs (scooter, wheelchair, stroller)
   Opens a finder in an overlay on top of the current page, so visitors never leave the site.
   Install once:  Booqable.loadScript('https://YOUR-FINDER-ADDRESS/popup.js');
   Triggers:
     - any link to "#find-my-scooter", "#find-my-wheelchair" or "#find-my-stroller" opens that finder
     - any link to a finder address (index.html, wheelchair.html, stroller.html) opens it
     - visiting a page with one of those #find-my-\u2026 endings opens it automatically
     - a floating "Find my\u2026" button (bottom right) that expands to show all three finders
   Optional settings, set before loading:  window.CR_FINDER = { floating: "auto" | "all" | "none" }
*/
(function () {
  if (window.__crFinderLoaded) return;
  window.__crFinderLoaded = true;

  var me = document.currentScript || document.querySelector('script[src*="popup.js"]');
  var BASE = me && me.src ? me.src.replace(/popup\.js.*$/, "") : "";
  var ORIGIN = BASE ? new URL(BASE).origin : "";

  var TOOLS = {
    scooter:    { file: "index.html",      label: "Find my scooter",    title: "Which mobility scooter should I hire?", ic: "\ud83d\udef5", sub: "Mobility scooters" },
    wheelchair: { file: "wheelchair.html", label: "Find my wheelchair", title: "Which wheelchair should I hire?",       ic: "\u267f", sub: "Manual and electric" },
    stroller:   { file: "stroller.html",   label: "Find my stroller",   title: "Which stroller should I hire?",         ic: "\ud83d\udc76", sub: "Strollers and wagons" }
  };
  var ORDER = ["scooter", "wheelchair", "stroller"];

  var cfg = window.CR_FINDER || {};
  var FLOATING = cfg.floating || "auto";
  var PAGE_TOOL = [
    [/wheelchair/i, "wheelchair"],
    [/stroller|pushchair|wagon|baby|buggy/i, "stroller"],
    [/scooter|mobility|ultralight|lightweight|heavyweight|rollator|knee/i, "scooter"]
  ];
  function pageTool() {
    for (var i = 0; i < PAGE_TOOL.length; i++) if (PAGE_TOOL[i][0].test(location.pathname)) return PAGE_TOOL[i][1];
    return null;
  }

  var css =
    ".crf-fabwrap{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font:600 15px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif}" +
    ".crf-fab{display:flex;align-items:center;gap:8px;background:#2D235C;color:#fff;border:0;border-radius:999px;padding:13px 18px;font:inherit;box-shadow:0 8px 24px rgba(45,35,92,.35);cursor:pointer}" +
    ".crf-fab:hover{background:#43368a}.crf-fab svg{width:18px;height:18px;flex:none}.crf-fab .crf-chev{transition:transform .2s}" +
    ".crf-fabwrap.open .crf-chev{transform:rotate(180deg)}" +
    ".crf-menu{display:none;background:#fff;border-radius:18px;box-shadow:0 12px 36px rgba(20,16,40,.25);padding:8px;min-width:250px}" +
    ".crf-fabwrap.open .crf-menu{display:block;animation:crfIn .18s ease}" +
    "@keyframes crfIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    ".crf-menu p{margin:6px 10px 8px;color:#5d5878;font-size:13px;font-weight:500}" +
    ".crf-item{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;border-radius:12px;padding:10px;cursor:pointer;text-align:left;font:inherit;color:#2D235C}" +
    ".crf-item:hover,.crf-item:focus-visible{background:#f3f1fa;outline:none}" +
    ".crf-item .crf-ic{width:38px;height:38px;border-radius:10px;background:#f3f1fa;display:grid;place-items:center;font-size:19px;flex:none}" +
    ".crf-item small{display:block;color:#5d5878;font-weight:500;font-size:12.5px;margin-top:2px}" +
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

  var back = null, lastFocus = null, current = null;

  function open(tool) {
    tool = TOOLS[tool] ? tool : "scooter";
    if (back) { if (current === tool) return; close(true); }
    closeMenu();
    current = tool;
    var t = TOOLS[tool];
    lastFocus = document.activeElement;
    back = document.createElement("div");
    back.className = "crf-back crf-loading";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-label", t.label);
    back.innerHTML =
      '<div class="crf-box"><button class="crf-x" type="button" aria-label="Close">\u00d7</button>' +
      '<iframe title="' + t.title + '" src="' + BASE + t.file + '?embed=1&start=1" allow="clipboard-write"></iframe></div>';
    document.body.appendChild(back);
    document.documentElement.classList.add("crf-lock");
    var frame = back.querySelector("iframe");
    var b = back;
    frame.addEventListener("load", function () { b.classList.remove("crf-loading"); frame.focus(); });
    back.querySelector(".crf-x").onclick = function () { close(); };
    back.addEventListener("click", function (e) { if (e.target === b) close(); });
    requestAnimationFrame(function () { b.classList.add("on"); });
    track(tool + "_finder_open", {});
  }

  function close(instant) {
    if (!back) return;
    var b = back;
    back = null; current = null;
    b.classList.remove("on");
    document.documentElement.classList.remove("crf-lock");
    if (instant) b.remove(); else setTimeout(function () { b.remove(); }, 200);
    if (/^#find-my-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    if (!instant && lastFocus && lastFocus.focus) lastFocus.focus();
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
    var tool = d.source === "cr-scooter-finder" ? "scooter" : (d.source === "cr-finder" ? d.tool : null);
    if (!tool) return;
    if (d.type === "close") close();
    if (d.type === "switch" && TOOLS[d.to]) open(d.to);
    if (d.type === "result") track(tool + "_finder_result", { product: d.scooter || d.product, exact_match: d.exact });
    if (d.type === "book") track(tool + "_finder_book_click", { product: d.scooter || d.product });
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); closeMenu(); } });

  function toolFromHref(a) {
    var href = a.getAttribute("href") || "";
    var m = href.match(/#find-my-(scooter|wheelchair|stroller)\b/);
    if (m) return m[1];
    if (BASE && a.href.indexOf(BASE) === 0) {
      if (a.href.indexOf("wheelchair.html") > -1) return "wheelchair";
      if (a.href.indexOf("stroller.html") > -1) return "stroller";
      return "scooter";
    }
    return null;
  }

  // Turn any link to a finder (or to #find-my-\u2026) into a pop-out trigger.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var tool = toolFromHref(a);
    if (!tool || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(tool);
  }, true);

  var wrap = null;
  function closeMenu() { if (wrap) { wrap.classList.remove("open"); wrap.querySelector(".crf-fab").setAttribute("aria-expanded", "false"); } }

  function addFab() {
    if (FLOATING === "none") return;
    var pt = pageTool();
    var home = location.pathname === "/" || location.pathname === "";
    if (FLOATING === "auto" && !pt && !home) return;
    var order = pt ? [pt].concat(ORDER.filter(function (k) { return k !== pt; })) : ORDER;
    wrap = document.createElement("div");
    wrap.className = "crf-fabwrap";
    wrap.innerHTML =
      '<div class="crf-menu" id="crf-menu" role="menu"><p>Answer a few quick questions and we\'ll recommend the right one.</p>' +
      order.map(function (k) {
        var t = TOOLS[k];
        return '<button type="button" class="crf-item" role="menuitem" data-tool="' + k + '"><span class="crf-ic" aria-hidden="true">' + t.ic + '</span><span>' + t.label + '<small>' + t.sub + '</small></span></button>';
      }).join("") + '</div>' +
      '<button type="button" class="crf-fab" aria-haspopup="true" aria-expanded="false" aria-controls="crf-menu">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<span>' + (pt ? TOOLS[pt].label : "Help me choose") + '</span>' +
      '<svg class="crf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></button>';
    document.body.appendChild(wrap);
    var fab = wrap.querySelector(".crf-fab");
    fab.onclick = function () {
      var isOpen = wrap.classList.toggle("open");
      fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) { var first = wrap.querySelector(".crf-item"); if (first) first.focus(); track("finder_menu_open", {}); }
    };
    wrap.querySelectorAll(".crf-item").forEach(function (b) { b.onclick = function () { open(b.dataset.tool); }; });
    document.addEventListener("click", function (e) { if (wrap && !wrap.contains(e.target)) closeMenu(); });
  }

  function fromHash() { var m = location.hash.match(/^#find-my-(scooter|wheelchair|stroller)$/); if (m) open(m[1]); }

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }
  ready(function () { addFab(); fromHash(); });
  window.addEventListener("hashchange", fromHash);

  window.CRFinder = { open: open, close: close };
})();
