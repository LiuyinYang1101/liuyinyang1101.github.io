// ===================================================
//  Liuyin Yang — Researcher Profile
// ===================================================
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------------------------------
  // Theme toggle (light / dark), persisted
  // -------------------------------------------------
  (function theme() {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function currentBg() {
      return getComputedStyle(document.body).backgroundColor || "#0a0b10";
    }
    function syncMeta() {
      var meta = document.getElementById("theme-color-dynamic");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.id = "theme-color-dynamic";
        // Insert BEFORE the media-scoped static metas so this one wins the
        // spec's first-match-in-tree-order rule (insertBefore(…, null) === append).
        document.head.insertBefore(meta, document.querySelector('meta[name="theme-color"]'));
      }
      meta.setAttribute("content", currentBg());
    }
    function syncState() {
      var dark = root.dataset.theme === "dark";
      var label = dark ? "Switch to light theme" : "Switch to dark theme";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
      syncMeta();
    }

    // Ensure an explicit value is set (the head script already did this,
    // but fall back to the OS preference if it did not run).
    if (!root.dataset.theme) {
      root.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    syncState();

    toggle.addEventListener("click", function () {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
      syncState();
    });
  })();

  // -------------------------------------------------
  // Hero EEG trace — ambient multi-channel signal
  // -------------------------------------------------
  (function eeg() {
    var host = document.querySelector(".hero-signal");
    if (!host) return;

    var NS = "http://www.w3.org/2000/svg";
    var W = 1200, H = 320, CH = 6, STEP = 7;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");

    var lane = H / (CH + 1);
    for (var c = 0; c < CH; c++) {
      var y0 = lane * (c + 1);
      var amp = lane * 0.42;
      // per-channel character
      var f1 = 0.012 + Math.random() * 0.01;
      var f2 = 0.045 + Math.random() * 0.03;
      var f3 = 0.11 + Math.random() * 0.06;
      var p1 = Math.random() * 6.28, p2 = Math.random() * 6.28, p3 = Math.random() * 6.28;
      // sparse "spikes" (evoked-response feel)
      var spikeAt = 120 + Math.random() * (W - 240);
      var spikeW = 34 + Math.random() * 26;
      var spikeDir = Math.random() > 0.5 ? 1 : -1;

      var d = "M 0 " + y0.toFixed(1);
      for (var x = STEP; x <= W; x += STEP) {
        var v = amp * (0.6 * Math.sin(x * f1 + p1) +
                       0.28 * Math.sin(x * f2 + p2) +
                       0.12 * Math.sin(x * f3 + p3));
        var dx = x - spikeAt;
        if (Math.abs(dx) < spikeW) {
          v += spikeDir * amp * 1.5 * Math.exp(-(dx * dx) / (2 * (spikeW / 3) * (spikeW / 3)));
        }
        d += " L " + x + " " + (y0 + v).toFixed(1);
      }

      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      // colour (not stroke) so the dark-mode drop-shadow glow takes the trace colour
      path.style.color = c % 2 === 0 ? "var(--signal-1)" : "var(--signal-2)";
      svg.appendChild(path);

      if (!reduceMotion && path.getTotalLength && typeof path.animate === "function") {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 2200, delay: c * 160, easing: "ease-out", fill: "forwards" }
        );
      }
    }
    host.appendChild(svg);
  })();

  // -------------------------------------------------
  // Publications filter (segmented control)
  // -------------------------------------------------
  (function filters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll(".items .item");
    var empty = document.querySelector(".items-empty");
    var status = document.getElementById("filter-status");
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.dataset.filter;
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        });

        var shown = 0;
        items.forEach(function (item) {
          var match = filter === "all" || item.dataset.type === filter;
          item.classList.toggle("hidden", !match);
          if (match) shown++;
        });
        if (empty) empty.hidden = shown !== 0;
        if (status) {
          status.textContent = shown === 0
            ? "No publications of this type."
            : shown + (shown === 1 ? " publication shown." : " publications shown.");
        }
      });
    });
  })();

  // -------------------------------------------------
  // Publication details: the selected item shows its full card
  // -------------------------------------------------
  (function pubDetails() {
    var list = document.querySelector(".items");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".item"));

    // The visible item right below the open card loses its top rule.
    function syncEdge() {
      var prevOpen = false;
      items.forEach(function (item) {
        if (item.classList.contains("hidden")) { item.classList.remove("after-open"); return; }
        item.classList.toggle("after-open", prevOpen);
        prevOpen = item.classList.contains("is-open");
      });
    }

    items.forEach(function (item, i) {
      var foot = item.querySelector(".item-foot");
      var desc = item.querySelector(".item-desc");
      if (!foot || !desc) return;
      desc.id = desc.id || "pub-detail-" + (i + 1);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item-toggle";
      btn.textContent = "Details";
      btn.setAttribute("aria-controls", desc.id);
      btn.setAttribute("aria-expanded", String(item.classList.contains("is-open")));
      foot.appendChild(btn);
    });

    function select(item) {
      var top = item.getBoundingClientRect().top;
      var open = !item.classList.contains("is-open");
      items.forEach(function (it) {
        var on = open && it === item;
        it.classList.toggle("is-open", on);
        var btn = it.querySelector(".item-toggle");
        if (btn) btn.setAttribute("aria-expanded", String(on));
      });
      syncEdge();
      // Keep the clicked item still while a card above it collapses.
      window.scrollBy({ top: item.getBoundingClientRect().top - top, behavior: "instant" });
    }

    list.addEventListener("click", function (e) {
      var item = e.target.closest(".item");
      if (!item || e.target.closest("a")) return;
      // A drag to select text is not a click on the item.
      if (!e.target.closest(".item-toggle") && String(window.getSelection())) return;
      select(item);
    });

    // Registered after the filter handlers, so it sees the new .hidden state.
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", syncEdge);
    });

    root.classList.add("pubs-ready");
    syncEdge();
  })();

  // -------------------------------------------------
  // Active section in nav
  // -------------------------------------------------
  (function activeNav() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".nav-links a");
    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
          });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  // -------------------------------------------------
  // Scroll reveal (progressive enhancement)
  // -------------------------------------------------
  (function reveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(
      ".cv-block, .items .item, .award, .stats, .connect > div"
    );
    if (!targets.length) return;

    root.classList.add("reveal-ready");
    targets.forEach(function (t) { t.classList.add("reveal"); });

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    targets.forEach(function (t) { observer.observe(t); });
  })();

})();
