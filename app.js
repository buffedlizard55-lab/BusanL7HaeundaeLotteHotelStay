/* ==========================================================================
   Busan L7 Haeundae Stay — Verified Travel Planner Application Script
   Stay Window: Mon Nov 9, 2026 (Check-in 15:00) → Mon Nov 16, 2026 (Check-out 11:00)
   ========================================================================== */

(function () {
  "use strict";

  // Visible error banner — never fail silently (the "empty site" bug).
  function showFatal(msg) {
    const div = document.createElement("div");
    div.id = "data-error-banner";
    div.style.cssText =
      "position:fixed;top:0;left:0;z-index:99999;background:#7f1d1d;color:#fff;" +
      "padding:18px 22px;font:14px/1.5 sans-serif;max-width:760px;margin:16px;" +
      "border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.35)";
    div.textContent = "⚠️ " + msg;
    (document.body || document.documentElement).prepend(div);
  }

  // The full dataset is inlined in the page as a JSON data block
  // (<script id="site-data" type="application/json">). External-script JSON
  // would not populate textContent, so it must be inline (see tools/build-site.py).
  const DATA_EL = document.getElementById("site-data");
  if (!DATA_EL) {
    showFatal("Data block (#site-data) not found — the page cannot render.");
    return;
  }
  let DATA = null;
  try {
    DATA = JSON.parse((DATA_EL.textContent || "").trim());
  } catch (err) {
    DATA = null;
  }
  if (!DATA || typeof DATA !== "object" || !Array.isArray(DATA.itineraries) || !DATA.itineraries.length) {
    showFatal("Itinerary data failed to load (the #site-data block is empty or invalid). Please refresh the page; if it persists, the site needs rebuilding via tools/build-site.py.");
    return;
  }

  // Helper selectors
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  
  const el = (tag, cls, html) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const formatSources = (sources) => {
    if (!sources || !sources.length) return "";
    return sources.map((s) =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="source-link">${esc(s.label || "Official source")} ↗</a>`
    ).join(" · ");
  };

  const getPaceClass = (difficulty) => {
    const d = (difficulty || "").toLowerCase();
    if (d.includes("easy")) return "easy";
    if (d.includes("moderate")) return "moderate";
    return "busy";
  };

  // Step Icon Selector based on activity type
  const getStepIcon = (step) => {
    const text = (step.what + " " + (step.detail || "")).toLowerCase();
    if (text.includes("check in") || text.includes("check out") || text.includes("hotel") || text.includes("pack")) return "🛏️";
    if (step.event || text.includes("concert") || text.includes("drone") || text.includes("bridge lift") || text.includes("ceremony") || text.includes("culture day")) return "🎟️";
    if (text.includes("shabu") || text.includes("lunch") || text.includes("dinner") || text.includes("breakfast") || text.includes("galbi") || text.includes("gukbap") || text.includes("milmyeon") || text.includes("noodles") || text.includes("hoetjip") || text.includes("eomuk")) return "🍜";
    if (text.includes("café") || text.includes("coffee") || text.includes("tea")) return "☕";
    if (text.includes("metro") || text.includes("subway") || text.includes("line 2") || text.includes("line 1") || text.includes("train") || text.includes("sky capsule")) return "🚇";
    if (text.includes("spa") || text.includes("jjimjilbang") || text.includes("bathhouse") || text.includes("hot springs")) return "🧖";
    if (text.includes("sunset") || text.includes("golden hour") || text.includes("dusk") || text.includes("sunrise")) return "🌅";
    if (text.includes("sky") || text.includes("tower") || text.includes("observatory") || text.includes("cable car")) return "🏙️";
    if (text.includes("temple") || text.includes("shrine")) return "⛩️";
    if (text.includes("museum") || text.includes("art") || text.includes("exhibition") || text.includes("othoniel") || text.includes("dureraum")) return "🎨";
    if (text.includes("aquarium") || text.includes("sea life") || text.includes("beach") || text.includes("harbor") || text.includes("ocean")) return "🌊";
    if (text.includes("market") || text.includes("jagalchi") || text.includes("gukje") || text.includes("kkangtong")) return "🛍️";
    if (text.includes("walk") || text.includes("trail") || text.includes("village") || text.includes("gamcheon") || text.includes("huinnyeoul")) return "🚶";
    return "📍";
  };

  /* ==========================================================================
     GLOBAL APP OBJECT
     ========================================================================== */
  window.app = {
    activeTab: "itineraries",
    activeSubview: "presets",
    activeItineraryId: DATA.itineraries[0].id,

    // Switch Main Tab
    switchTab: function (tabId) {
      this.activeTab = tabId;
      $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
      $$(".tab-pane").forEach((p) => p.classList.toggle("active", p.id === `tab-${tabId}`));
      window.scrollTo({ top: $("#main-nav").offsetTop - 10, behavior: "smooth" });
    },

    // Switch Subview in Itineraries Tab
    switchView: function (tabId, subviewId) {
      this.switchTab(tabId);
      this.activeSubview = subviewId;
      $$(".subview-btn").forEach((b) => b.classList.toggle("active", b.dataset.subview === subviewId));
      $$(".subview-content").forEach((c) => c.classList.toggle("active", c.id === `subview-${subviewId}`));
    },

    // Select Itinerary
    selectItinerary: function (id) {
      this.activeItineraryId = id;
      this.switchView("itineraries", "daily");
      renderDailyExplorer();
      const view = $("#itinerary-detail-view");
      if (view) {
        view.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },

    // Copy Itinerary schedule to clipboard
    copyItineraryText: function (itId) {
      const it = DATA.itineraries.find((x) => x.id === itId);
      if (!it) return;
      let text = `BUSAN ITINERARY: ${it.days} — ${it.title}\n`;
      text += `Cluster: ${it.cluster || "Busan"}\n`;
      text += `Pace: ${it.difficulty}\n`;
      text += `Transit: ${it.transit}\n\n`;
      text += `SCHEDULE:\n`;
      it.steps.forEach((s) => {
        text += `• [${s.time}] ${s.what}\n  ${s.detail || ""}\n`;
      });
      navigator.clipboard.writeText(text).then(() => {
        alert(`Copied "${it.title}" schedule to clipboard!`);
      }).catch(() => {
        alert("Schedule copied!");
      });
    },

    // Jump to food filtered by area
    jumpToFoodArea: function (areaKeyword) {
      this.switchTab("food");
      const select = $("#food-area-select");
      if (select) {
        for (let opt of select.options) {
          if (opt.value && areaKeyword && opt.value.toLowerCase().includes(areaKeyword.toLowerCase())) {
            select.value = opt.value;
            renderFoodTable();
            return;
          }
        }
        select.value = "";
        const searchInput = $("#food-search-input");
        if (searchInput) {
          searchInput.value = areaKeyword;
          renderFoodTable();
        }
      }
    }
  };

  /* ==========================================================================
     INIT TAB NAVIGATION & SUBVIEWS
     ========================================================================== */
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.app.switchTab(btn.dataset.tab);
    });
  });

  $$(".subview-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.app.switchView("itineraries", btn.dataset.subview);
    });
  });

  /* ==========================================================================
     RENDER PRESETS (7-DAY PLANS)
     ========================================================================== */
  function renderPresetTrips() {
    const container = $("#presets-container");
    if (!container || !DATA.trip_presets) return;
    container.innerHTML = "";

    DATA.trip_presets.forEach((preset) => {
      const card = el("div", "preset-card");
      
      let daysHtml = preset.days.map((d) => {
        const paceCls = getPaceClass(d.pace);
        return `
          <div class="preset-day-chip" onclick="app.selectItinerary('${d.it_id}')" title="Click to view full timeline">
            <div class="chip-day-num">Day ${d.day_num} · ${esc(d.date.split(' ')[1])}</div>
            <div class="chip-theme">${esc(d.theme)}</div>
            <span class="chip-pace ${paceCls}">${esc(d.pace)}</span>
          </div>
        `;
      }).join("");

      card.innerHTML = `
        <div class="preset-header">
          <div class="preset-title-wrap">
            <div class="preset-title">${esc(preset.name)}</div>
            <span class="preset-badge">${esc(preset.badge)}</span>
          </div>
          <span class="preset-pace-badge">⚡ Pace: ${esc(preset.pace_breakdown)}</span>
        </div>
        <p class="preset-desc">${esc(preset.description)}</p>
        <div class="preset-days-strip">${daysHtml}</div>
        <div class="preset-footer-actions">
          <button class="btn btn-primary" onclick="app.selectItinerary('${preset.days[0].it_id}')">🔍 Start Day 1 in Timeline Explorer</button>
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print This 7-Day Plan</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* ==========================================================================
     RENDER MASTER ITINERARIES TABLE
     ========================================================================== */
  let activePaceFilter = "all";

  function renderMasterTable() {
    const tbody = $("#master-it-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const q = ($("#itinerary-search") ? $("#itinerary-search").value : "").toLowerCase();

    const filtered = DATA.itineraries.filter((it) => {
      const paceMatch = activePaceFilter === "all" || it.difficulty.toLowerCase().includes(activePaceFilter.toLowerCase());
      const queryMatch = !q || (
        it.id + " " + it.days + " " + it.title + " " + (it.cluster || "") + " " +
        (it.highlights || []).join(" ") + " " + (it.meals || []).join(" ")
      ).toLowerCase().includes(q);
      return paceMatch && queryMatch;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">No matching itineraries found.</td></tr>`;
      return;
    }

    filtered.forEach((it) => {
      const paceCls = getPaceClass(it.difficulty);
      const tr = el("tr");
      tr.innerHTML = `
        <td class="name-col">
          <strong>${esc(it.id)}</strong><br>
          <small style="color:var(--text-muted);">${esc(it.days)}</small>
        </td>
        <td><strong>${esc(it.title)}</strong></td>
        <td><span class="count-badge">${esc(it.cluster || "Busan")}</span></td>
        <td><span class="badge-pace ${paceCls}">${esc(it.difficulty)}</span></td>
        <td><small>${esc(it.transit)}</small></td>
        <td><small>${(it.highlights || []).map(h => `• ${esc(h)}`).join('<br>')}</small></td>
        <td><small>${(it.meals || []).map(m => `🍜 ${esc(m)}`).join('<br>')}</small></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="app.selectItinerary('${it.id}')">View Day ↗</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Setup Master Table pace filter buttons
  $$("#table-pace-filters .pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#table-pace-filters .pill-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activePaceFilter = btn.dataset.pace;
      renderMasterTable();
    });
  });

  if ($("#itinerary-search")) {
    $("#itinerary-search").addEventListener("input", renderMasterTable);
  }

  /* ==========================================================================
     RENDER DAILY TIMELINE EXPLORER
     ========================================================================== */
  function renderDailyExplorer() {
    const picker = $("#daily-picker");
    const view = $("#itinerary-detail-view");
    if (!picker || !view) return;

    // Render Picker Strip
    picker.innerHTML = "";
    DATA.itineraries.forEach((it) => {
      const isActive = it.id === window.app.activeItineraryId;
      const paceCls = getPaceClass(it.difficulty);
      const btn = el("button", `day-card-btn${isActive ? " active" : ""}`);
      btn.innerHTML = `
        <div class="btn-day-label">${esc(it.id)} · ${esc(it.days.split(' ')[0])}</div>
        <div class="btn-day-title">${esc(it.title)}</div>
        <div class="btn-day-meta">
          <span class="badge-pace ${paceCls}">${esc(it.difficulty)}</span>
          <small style="color:var(--text-muted); font-size:11px;">${it.steps.length} steps</small>
        </div>
      `;
      btn.addEventListener("click", () => {
        window.app.activeItineraryId = it.id;
        renderDailyExplorer();
      });
      picker.appendChild(btn);
    });

    // Render Active Itinerary Detail Card
    const it = DATA.itineraries.find((x) => x.id === window.app.activeItineraryId) || DATA.itineraries[0];
    const paceCls = getPaceClass(it.difficulty);

    const highlightsHtml = (it.highlights && it.highlights.length) ? `
      <div class="it-highlights-box">
        <div class="it-highlights-title">⭐ Day Highlights &amp; Must-Do Stops:</div>
        <ul class="it-highlights-list">
          ${it.highlights.map(h => `<li>${esc(h)}</li>`).join("")}
        </ul>
      </div>
    ` : "";

    const timelineStepsHtml = it.steps.map((s) => {
      const icon = getStepIcon(s);
      return `
        <div class="timeline-node${s.event ? " event" : ""}">
          <div class="timeline-icon">${icon}</div>
          <div class="node-time">${esc(s.time)}</div>
          <div class="node-title-row">
            <span class="node-what">${esc(s.what)}</span>
            ${s.event ? `<span class="event-verified-tag">✓ Confirmed In-Window Event</span>` : ""}
          </div>
          ${s.detail ? `
            <div class="node-detail">
              ${esc(s.detail)}
              ${s.link ? `<br><a href="${esc(s.link)}" target="_blank" rel="noopener" class="source-link">🔗 Official Operator / Booking Link ↗</a>` : ""}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");

    view.innerHTML = `
      <div class="itinerary-detail-card">
        <div class="it-header-strip">
          <div class="it-title-block">
            <div class="btn-day-label">${esc(it.days)}</div>
            <h3>${esc(it.id)}: ${esc(it.title)}</h3>
            <div class="it-meta-row">
              <span class="badge-pace ${paceCls}">Pace: ${esc(it.difficulty)}</span>
              <span>📍 <strong>Cluster:</strong> ${esc(it.cluster || "Busan")}</span>
              ${it.sunset ? `<span>🌅 <strong>Sunset:</strong> ${esc(it.sunset)}</span>` : ""}
            </div>
          </div>
          <div class="it-actions-row">
            <button class="btn btn-secondary btn-sm" onclick="app.copyItineraryText('${it.id}')">📋 Copy Schedule</button>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print Day</button>
          </div>
        </div>

        ${highlightsHtml}

        <div class="it-transit-banner">
          <strong>🚇 Transportation &amp; Walking Plan:</strong> ${esc(it.transit)}
        </div>

        <div class="timeline-track">
          ${timelineStepsHtml}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     RENDER CUSTOM TRIP BUILDER
     ========================================================================== */
  const DEFAULT_CUSTOM_SELECTIONS = ["I1", "I2", "I3", "I4", "I5", "I6", "I8", "I9"];
  const STAY_DAY_LABELS = [
    { num: 1, date: "Mon Nov 9", note: "Check-in after 15:00" },
    { num: 2, date: "Tue Nov 10", note: "Full Day" },
    { num: 3, date: "Wed Nov 11", note: "Remembrance & Culture Day" },
    { num: 4, date: "Thu Nov 12", note: "Full Day" },
    { num: 5, date: "Fri Nov 13", note: "Gugak Concert Night" },
    { num: 6, date: "Sat Nov 14", note: "Bridge Lift & Drone Show" },
    { num: 7, date: "Sun Nov 15", note: "Relax / Far Excursion" },
    { num: 8, date: "Mon Nov 16", note: "Check-out before 11:00" }
  ];

  let currentCustomSelections = [...DEFAULT_CUSTOM_SELECTIONS];

  function renderTripBuilder() {
    const slotsContainer = $("#builder-slots");
    if (!slotsContainer) return;
    slotsContainer.innerHTML = "";

    STAY_DAY_LABELS.forEach((d, idx) => {
      const slot = el("div", "builder-day-slot");
      const selectedItId = currentCustomSelections[idx] || "I1";
      const selectedIt = DATA.itineraries.find((x) => x.id === selectedItId) || DATA.itineraries[0];
      const paceCls = getPaceClass(selectedIt.difficulty);

      let optionsHtml = DATA.itineraries.map((it) => {
        return `<option value="${it.id}" ${it.id === selectedItId ? "selected" : ""}>${it.id}: ${it.title} (${it.difficulty})</option>`;
      }).join("");

      slot.innerHTML = `
        <div class="slot-label">Day ${d.num} · ${d.date} (${d.note})</div>
        <select class="slot-select" data-day-index="${idx}">${optionsHtml}</select>
        <span class="slot-pace-tag badge-pace ${paceCls}">${selectedIt.difficulty}</span>
      `;
      slotsContainer.appendChild(slot);
    });

    // Event listeners on selects
    $$(".slot-select", slotsContainer).forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.dayIndex, 10);
        currentCustomSelections[idx] = e.target.value;
        renderTripBuilder();
      });
    });

    updateBuilderSummary();
  }

  function updateBuilderSummary() {
    let easy = 0, mod = 0, busy = 0;
    currentCustomSelections.forEach((itId) => {
      const it = DATA.itineraries.find((x) => x.id === itId);
      if (it) {
        const p = getPaceClass(it.difficulty);
        if (p === "easy") easy++;
        else if (p === "moderate") mod++;
        else busy++;
      }
    });

    if ($("#builder-easy-count")) $("#builder-easy-count").textContent = easy;
    if ($("#builder-mod-count")) $("#builder-mod-count").textContent = mod;
    if ($("#builder-busy-count")) $("#builder-busy-count").textContent = busy;
  }

  if ($("#btn-reset-builder")) {
    $("#btn-reset-builder").addEventListener("click", () => {
      currentCustomSelections = [...DEFAULT_CUSTOM_SELECTIONS];
      renderTripBuilder();
      const out = $("#custom-trip-output");
      if (out) out.style.display = "none";
    });
  }

  if ($("#btn-render-custom")) {
    $("#btn-render-custom").addEventListener("click", () => {
      const out = $("#custom-trip-output");
      if (!out) return;
      out.style.display = "block";
      
      let html = `<h4 style="font-family:var(--font-display); font-size:18px; margin-bottom:16px;">📋 Your Custom 7-Night Busan Itinerary Booklet</h4>`;
      currentCustomSelections.forEach((itId, idx) => {
        const d = STAY_DAY_LABELS[idx];
        const it = DATA.itineraries.find((x) => x.id === itId);
        if (!it) return;
        const paceCls = getPaceClass(it.difficulty);
        html += `
          <div style="border-bottom:1px solid var(--card-border); padding:16px 0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
              <strong>Day ${d.num} · ${d.date} (${d.note}) — ${esc(it.title)}</strong>
              <span class="badge-pace ${paceCls}">${esc(it.difficulty)}</span>
            </div>
            <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">🚇 ${esc(it.transit)}</div>
            <ul style="padding-left:20px; font-size:13px; line-height:1.6;">
              ${it.steps.map(s => `<li><strong>[${esc(s.time)}]</strong> ${esc(s.what)} ${s.detail ? `— ${esc(s.detail)}` : ""}</li>`).join("")}
            </ul>
          </div>
        `;
      });
      out.innerHTML = html;
      out.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ==========================================================================
     RENDER CONFIRMED EVENTS
     ========================================================================== */
  function renderEvents() {
    const inContainer = $("#in-window-events");
    const outContainer = $("#out-window-events");
    if (!inContainer) return;

    inContainer.innerHTML = "";
    DATA.events.forEach((ev) => {
      const card = el("div", "event-item-card");
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
          <h3>${esc(ev.name)}</h3>
          <span class="event-verified-tag">Verified In Window</span>
        </div>
        <div class="event-item-meta">
          📅 <strong>${esc(ev.date)}</strong> · ⏰ ${esc(ev.time)} · 📍 ${esc(ev.venue)} (${esc(ev.area)}) · 🎟️ <strong>${esc(ev.price)}</strong>
        </div>
        <p class="event-item-status">${esc(ev.status)}</p>
        <div class="event-item-sources">${formatSources(ev.sources)}</div>
      `;
      inContainer.appendChild(card);
    });

    if (outContainer && DATA.events_out_of_window) {
      outContainer.innerHTML = "";
      DATA.events_out_of_window.forEach((ev) => {
        const item = el("div", "out-event-item");
        item.innerHTML = `
          <h4>${esc(ev.name)}</h4>
          <div class="out-date">📅 ${esc(ev.date)}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin:4px 0 8px;">${esc(ev.status || "Outside Nov 9–16 window")}</p>
          <a href="${esc(ev.source)}" target="_blank" rel="noopener" class="source-link">Official source ↗</a>
        `;
        outContainer.appendChild(item);
      });
    }
  }

  /* ==========================================================================
     RENDER NEIGHBORHOOD CLUSTERS
     ========================================================================== */
  function renderClusters() {
    const container = $("#clusters-container");
    if (!container || !DATA.clusters) return;
    container.innerHTML = "";

    DATA.clusters.forEach((c) => {
      const card = el("div", "cluster-zone-card");
      card.innerHTML = `
        <div class="zone-header">
          <div class="zone-name">${esc(c.name)}</div>
          <span class="zone-transit-badge">${esc(c.transit_from_l7)}</span>
        </div>
        <div style="font-size:12px; color:var(--ocean-700); font-weight:600; margin-bottom:6px;">🚇 ${esc(c.metro_stops)}</div>
        <p class="zone-char">${esc(c.character)}</p>
        <div class="zone-list-block">
          <strong>Key Verified Places:</strong><br>
          ${c.key_places.map(p => `• ${esc(p)}`).join('<br>')}
        </div>
        <div class="zone-list-block" style="margin-top:10px;">
          <strong>Verified Eateries:</strong><br>
          ${c.verified_food.map(f => `🍜 ${esc(f)}`).join('<br>')}
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* ==========================================================================
     RENDER PLACES DIRECTORY
     ========================================================================== */
  function initPlacesFilters() {
    const select = $("#places-area-select");
    if (!select) return;
    const areas = new Set();
    DATA.places.forEach((p) => {
      const a = (p.area || "").split("/")[0].trim();
      if (a) areas.add(a);
    });
    areas.forEach((a) => {
      select.appendChild(el("option", "", esc(a)));
    });

    select.addEventListener("change", renderPlacesTable);
    if ($("#places-price-select")) $("#places-price-select").addEventListener("change", renderPlacesTable);
    if ($("#places-search-input")) $("#places-search-input").addEventListener("input", renderPlacesTable);
  }

  function renderPlacesTable() {
    const tbody = $("#places-table-main tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const area = $("#places-area-select") ? $("#places-area-select").value : "";
    const price = $("#places-price-select") ? $("#places-price-select").value : "";
    const q = ($("#places-search-input") ? $("#places-search-input").value : "").toLowerCase();

    const filtered = DATA.places.filter((p) => {
      const areaMatch = !area || (p.area || "").includes(area);
      const priceMatch = !price || (price === "Free" ? (p.price || "").toLowerCase().includes("free") : !(p.price || "").toLowerCase().includes("free"));
      const queryMatch = !q || (p.name + " " + (p.area || "") + " " + (p.hours || "") + " " + (p.price || "") + " " + (p.status || "")).toLowerCase().includes(q);
      return areaMatch && priceMatch && queryMatch;
    });

    if ($("#places-count-badge")) {
      $("#places-count-badge").textContent = `Showing ${filtered.length} of ${DATA.places.length} places`;
    }

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No matching places found.</td></tr>`;
      return;
    }

    filtered.forEach((p) => {
      const tr = el("tr");
      tr.innerHTML = `
        <td class="name-col">${esc(p.name)}</td>
        <td><span class="count-badge">${esc(p.area)}</span></td>
        <td><small>${esc(p.hours)}</small></td>
        <td><strong>${esc(p.price)}</strong></td>
        <td><small style="color:var(--emerald-700); font-weight:600;">${esc(p.status)}</small></td>
        <td>${formatSources(p.sources)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     RENDER FOOD DIRECTORY
     ========================================================================== */
  let activeFoodCategory = "all";

  function initFoodFilters() {
    const select = $("#food-area-select");
    if (!select) return;
    const areas = new Set();
    DATA.food.forEach((f) => {
      const a = (f.area || "").split(",")[0].trim();
      if (a) areas.add(a);
    });
    [...areas].sort().forEach((a) => {
      select.appendChild(el("option", "", esc(a)));
    });

    select.addEventListener("change", renderFoodTable);
    if ($("#food-search-input")) $("#food-search-input").addEventListener("input", renderFoodTable);

    // Food category pills
    $$("#food-cat-pills .cat-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#food-cat-pills .cat-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFoodCategory = btn.dataset.cat;
        renderFoodTable();
      });
    });
  }

  function renderFoodTable() {
    const tbody = $("#food-table-main tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const area = $("#food-area-select") ? $("#food-area-select").value : "";
    const q = ($("#food-search-input") ? $("#food-search-input").value : "").toLowerCase();

    const filtered = DATA.food.filter((f) => {
      const catMatch = activeFoodCategory === "all" || (f.category || "").toLowerCase() === activeFoodCategory.toLowerCase();
      const areaMatch = !area || (f.area || "").includes(area);
      const queryMatch = !q || (f.name + " " + (f.category || "") + " " + (f.area || "") + " " + (f.hours || "")).toLowerCase().includes(q);
      return catMatch && areaMatch && queryMatch;
    });

    if ($("#food-count-badge")) {
      $("#food-count-badge").textContent = `Showing ${filtered.length} of ${DATA.food.length} eateries`;
    }

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">No matching restaurants or cafés found.</td></tr>`;
      return;
    }

    filtered.forEach((f) => {
      const tr = el("tr");
      tr.innerHTML = `
        <td class="name-col">🍜 ${esc(f.name)}</td>
        <td><span class="count-badge">${esc(f.category || "Korean")}</span></td>
        <td><small>${esc(f.area)}</small></td>
        <td><small>${esc(f.hours)}</small></td>
        <td><a href="${esc(f.source)}" target="_blank" rel="noopener" class="source-link">Official Portal Listing ↗</a></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     RENDER DUO TRAVELER TOOLS (SUNSET & BUDGET ESTIMATOR)
     ========================================================================== */
  function renderSunsetTimetable() {
    const tbody = $("#sunset-tbody");
    if (!tbody || !DATA.sunset_timetable) return;
    tbody.innerHTML = "";

    DATA.sunset_timetable.forEach((item) => {
      const tr = el("tr");
      tr.innerHTML = `
        <td class="name-col">${esc(item.date)}</td>
        <td>${esc(item.sunrise)}</td>
        <td><strong>${esc(item.sunset)}</strong></td>
        <td><span class="count-badge" style="background:var(--amber-100); color:var(--amber-900);">📸 ${esc(item.photo_golden_hour)}</span></td>
        <td><small>${esc(item.recommendation)}</small></td>
      `;
      tbody.appendChild(tr);
    });
  }

  const BUDGET_ACTIVITIES = [
    { id: "b_sky", name: "Busan X the Sky (100F LCT Landmark)", cost2: 58000, desc: "2 Adults (₩29,000 × 2)" },
    { id: "b_capsule", name: "Haeundae Blueline Sky Capsule (Mipo→Cheongsapo)", cost2: 50000, desc: "2-Person Capsule (₩50,000)" },
    { id: "b_train", name: "Blueline Beach Train All-Day Passes", cost2: 32000, desc: "2 Adults All-Station (₩16,000 × 2)" },
    { id: "b_spa", name: "Shinsegae Centum Spa Land (4-Hour Jjimjilbang)", cost2: 52000, desc: "2 Adults (₩26,000 × 2)" },
    { id: "b_gugak", name: "National Gugak Center 'Korea in Sound' Concert", cost2: 20000, desc: "2 Adults (₩10,000 × 2) on Fri Nov 13" },
    { id: "b_cablecar", name: "Songdo Marine Cable Car (Air Cruise RT)", cost2: 38000, desc: "2 Adults (₩19,000 × 2)" },
    { id: "b_othoniel", name: "F1963 Jean-Michel Othoniel Exhibition", cost2: 20000, desc: "2 Adults (₩10,000 × 2)" },
    { id: "b_tower", name: "Busan Tower Observatory (Yongdusan Park)", cost2: 24000, desc: "2 Adults (₩12,000 × 2)" },
    { id: "b_sealife", name: "SEA LIFE Busan Aquarium (Haeundae Beach)", cost2: 62000, desc: "2 Adults Standard Admission (~₩31,000 × 2)" }
  ];

  function renderBudgetEstimator() {
    const list = $("#budget-checklist");
    if (!list) return;
    list.innerHTML = "";

    BUDGET_ACTIVITIES.forEach((item, idx) => {
      const label = el("label", "budget-item-label");
      label.innerHTML = `
        <input type="checkbox" class="budget-cb" data-cost="${item.cost2}" ${idx < 5 ? "checked" : ""}>
        <div class="budget-item-title">${esc(item.name)} <br><small style="color:var(--text-muted); font-size:11.5px;">${esc(item.desc)}</small></div>
        <div class="budget-item-cost">₩${item.cost2.toLocaleString()}</div>
      `;
      list.appendChild(label);
    });

    $$(".budget-cb", list).forEach((cb) => {
      cb.addEventListener("change", calculateBudgetTotal);
    });

    calculateBudgetTotal();
  }

  function calculateBudgetTotal() {
    let totalKrw = 0;
    $$(".budget-cb").forEach((cb) => {
      if (cb.checked) {
        totalKrw += parseInt(cb.dataset.cost, 10);
      }
    });

    const usd = (totalKrw / 1350).toFixed(2);
    if ($("#budget-krw-val")) $("#budget-krw-val").textContent = `₩${totalKrw.toLocaleString()}`;
    if ($("#budget-usd-val")) $("#budget-usd-val").textContent = `Approx. $${usd} USD (2 Travelers)`;
  }

  /* ==========================================================================
     RENDER FLAGS & SPORTS
     ========================================================================== */
  function renderFlagsAndSports() {
    const sportsContainer = $("#sports-container");
    const flagsContainer = $("#flags-container");

    if (sportsContainer && DATA.sports) {
      sportsContainer.innerHTML = "";
      DATA.sports.forEach((s) => {
        const card = el("div", "sport-item-card");
        card.innerHTML = `
          <h4>⚽ ${esc(s.league)}</h4>
          <p>${esc(s.status)}</p>
          <a href="${esc(s.source)}" target="_blank" rel="noopener" class="source-link">Official league site ↗</a>
        `;
        sportsContainer.appendChild(card);
      });
    }

    if (flagsContainer && DATA.flags) {
      flagsContainer.innerHTML = "";
      DATA.flags.forEach((f) => {
        const li = el("li", "", `⚠️ ${esc(f)}`);
        flagsContainer.appendChild(li);
      });
    }
  }

  /* ==========================================================================
     RENDER SOURCES & LIVE VERIFICATION LEDGER
     ========================================================================== */
  const LIVE_CHECKS = [
    ["Busan X the Sky — Operator Page", "Confirmed live: daily 10:00–21:00; ₩29,000 adult / ₩26,000 child & senior; last ticket 20:30.", "https://www.busanxthesky.com/xthesky/xthesky.php", "ok"],
    ["SEA LIFE Busan — Opening Hours", "Confirmed live: Mon–Fri 10:00–19:00 (last entry 18:00); Sat–Sun 10:00–20:00 (last entry 19:00).", "https://www.visitsealife.com/busan/plan-your-visit/before-you-visit/opening-hours/", "ok"],
    ["Blueline Park — Fares & Schedule", "Confirmed live: Beach Train ₩10k/₩14k/₩16k; Sky Capsule ₩50k–₩60k per capsule; packages ₩73k–₩111k.", "https://www.bluelinepark.com/fare.do", "ok"],
    ["UN Memorial Cemetery — UNMCK", "Confirmed live: free; open 365 days; Oct–Apr 09:00–17:00.", "https://www.unmck.or.kr/eng/main/", "ok"],
    ["Gwangalli M Drone Light Show", "Confirmed: every Saturday; winter (Oct–Feb) 19:00 & 21:00; ~12 min; free; runs through Dec 31, 2026.", "https://www.gwangallimdrone.co.kr/", "ok"],
    ["National Gugak Center Busan — 'Korea in Sound'", "Confirmed live: Fri Nov 13, 19:30, Yeji-dang, ₩10,000; tickets from Oct 13, 2026 14:00.", "https://busan.gugak.go.kr/BG/contents/BG0101020000.do?prfmSn=6088&prfmDtSn=3&schM=view", "ok"],
    ["Yeongdo Bridge Lift Schedule", "Confirmed live: every Saturday 14:00 for 15 minutes, free.", "https://www.busan.go.kr/eng/the-seven-bridges-of-busan", "ok"],
    ["F1963 — Othoniel 'In the Labyrinth of Love'", "Confirmed live: Aug 28–Dec 31, 2026; 10:00–18:00 (last entry 17:30); closed Mon; ₩10,000.", "https://www.f1963.org/ko/?c=art&s=1&gbn=viewok&ix=496", "ok"],
    ["Shinsegae Spa Land (Centum City)", "Confirmed live: 08:00–23:00 (last entry 22:00); ₩26,000 adult / ₩21,000 student; 4-hour ticket.", "https://www.shinsegae.com/store/entertainment/centum-spaland.do?storeCd=SC00008", "ok"],
    ["Sunset Times (Busan, Nov 2026)", "Confirmed live via TimeAndDate Nov 2026 table: Nov 9 sunset 17:22 down to Nov 16 sunset 17:17.", "https://www.timeanddate.com/sun/south-korea/busan?month=11&year=2026", "ok"],
    ["L7 HAEUNDAE — Floating Restaurant", "Confirmed live: breakfast buffet 07:00–10:00 daily, Floating, 2nd floor; check-in 15:00 / check-out 11:00.", "https://www.lottehotel.com/haeundae-l7/en/", "ok"],
    ["Lotte World Adventure Busan", "Confirmed live: today 10:00–21:00; November hours date-specific — confirm before going.", "https://adventurebusan.lotteworld.com/", "warn"],
    ["KOVO Volleyball Fixtures", "Season opens Oct 31, 2026; November home dates on JS pages — re-check in October.", "https://www.kovo.co.kr", "warn"],
    ["KBL / WKBL Basketball Fixtures", "Schedules published Aug 10, 2026; exact Nov home dates to be verified in October.", "https://www.kbl.or.kr", "warn"],
    ["Beomeosa Temple", "Verified: grounds open daily; free; foliage peaks mid-November.", "https://www.beomeo.kr", "ok"],
    ["Dongnae Hot Springs (Heosimcheong)", "Verified: Hotel Nongshim operator; ticketed bathhouse.", "https://www.hotelnongshim.com", "ok"],
    ["Songdo Marine Cable Car", "Verified: Air Cruise ₩19,000 adult RT (Crystal ₩24,000); weather dependent.", "http://busanaircruise.co.kr", "ok"],
    ["Gamcheon Culture Village", "Verified: open daily; stamp-map from info center; residential area.", "https://www.gamcheon.or.kr", "ok"]
  ];

  function renderLiveChecks() {
    const container = $("#live-checks-container");
    if (!container) return;
    container.innerHTML = "";

    LIVE_CHECKS.forEach(([title, note, url, cls]) => {
      const row = el("div", "live-check-row");
      row.innerHTML = `
        <span class="check-icon ${cls}">${cls === "ok" ? "✔" : "⚠"}</span>
        <div style="flex:1;">
          <strong>${esc(title)}</strong> — ${esc(note)}<br>
          <a href="${esc(url)}" target="_blank" rel="noopener" class="source-link">Official verified URL ↗</a>
        </div>
      `;
      container.appendChild(row);
    });
  }

  let masterSourceRows = [];

  function initSourcesTable() {
    const tbody = $("#sources-table-main tbody");
    if (!tbody) return;

    const seen = new Set();
    masterSourceRows = [];

    const addSrc = (url, label) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        masterSourceRows.push({ url, label: label || url });
      }
    };

    addSrc("https://english.visitbusan.net", "Visit Busan (Official Tourism Portal)");
    addSrc("https://www.lottehotel.com/haeundae-l7/en/", "L7 HAEUNDAE by LOTTE HOTELS (Official Site)");
    
    DATA.places.forEach((p) => (p.sources || []).forEach(s => addSrc(s.url, p.name)));
    DATA.events.forEach((e) => (e.sources || []).forEach(s => addSrc(s.url, e.name)));
    DATA.food.forEach((f) => addSrc(f.source, f.name));
    DATA.sports.forEach((s) => addSrc(s.source, s.league));
    (DATA.events_out_of_window || []).forEach((e) => addSrc(e.source, e.name));

    renderSourcesTable();

    if ($("#source-search-input")) {
      $("#source-search-input").addEventListener("input", renderSourcesTable);
    }
  }

  function renderSourcesTable() {
    const tbody = $("#sources-table-main tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const q = ($("#source-search-input") ? $("#source-search-input").value : "").toLowerCase();

    const filtered = masterSourceRows.filter((r) => {
      return !q || (r.label + " " + r.url).toLowerCase().includes(q);
    });

    if ($("#source-count-badge")) {
      $("#source-count-badge").textContent = `Showing ${filtered.length} of ${masterSourceRows.length} source links`;
    }

    filtered.forEach((r, idx) => {
      const tr = el("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td class="name-col">${esc(r.label)}</td>
        <td><a href="${esc(r.url)}" target="_blank" rel="noopener" class="source-link">${esc(r.url)} ↗</a></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     INIT ALL MODULES ON DOM READY
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    renderPresetTrips();
    renderMasterTable();
    renderDailyExplorer();
    renderTripBuilder();
    renderEvents();
    renderClusters();
    initPlacesFilters();
    renderPlacesTable();
    initFoodFilters();
    renderFoodTable();
    renderSunsetTimetable();
    renderBudgetEstimator();
    renderFlagsAndSports();
    renderLiveChecks();
    initSourcesTable();
  });

})();
