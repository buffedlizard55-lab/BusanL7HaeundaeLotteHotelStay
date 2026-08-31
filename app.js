/* Busan L7 Haeundae Stay — itinerary planner UI (data-driven, all data in data.json) */
(function () {
  "use strict";

  const DATA_EL = document.getElementById("site-data");
  const DATA = JSON.parse(DATA_EL.textContent);

  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const srcLinks = (srcs) => srcs.map((s) =>
    `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label || s.url)} ↗</a>`
  ).join(" ");

  /* ---------- hotel line ---------- */
  $("#hotel-line").textContent =
    `${DATA.stay.hotel} · ${DATA.stay.address} · ${DATA.stay.location_notes}`;

  /* ---------- tabs ---------- */
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tabpanel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $("#tab-" + btn.dataset.tab).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ---------- itineraries ---------- */
  const picker = $("#itinerary-picker");
  const view = $("#itinerary-view");
  let activeIt = DATA.itineraries[0].id;

  function renderItineraries() {
    picker.innerHTML = "";
    DATA.itineraries.forEach((it) => {
      const b = el("button", "it-btn" + (it.id === activeIt ? " active" : ""));
      b.innerHTML =
        `<div class="it-day">${esc(it.days)}</div>` +
        `<div class="it-title">${esc(it.title)}</div>` +
        `<div class="it-diff diff-${esc(it.difficulty.toLowerCase().split(" ")[0])}">${esc(it.difficulty)}</div>` +
        `<div class="it-transit">🚇 ${esc(it.transit)}</div>`;
      b.addEventListener("click", () => { activeIt = it.id; renderItineraries(); });
      picker.appendChild(b);
    });
    const it = DATA.itineraries.find((x) => x.id === activeIt) || DATA.itineraries[0];
    const card = el("div", "itinerary-card");
    card.innerHTML =
      `<div class="head"><h2>${esc(it.title)}</h2></div>` +
      `<div class="sub">${esc(it.days)} · <b>Pace:</b> ${esc(it.difficulty)}</div>` +
      `<div class="transit-note"><strong>Transport plan:</strong> ${esc(it.transit)}</div>` +
      `<div class="timeline">` +
      it.steps.map((s, i) =>
        `<div class="tl-item${s.event ? " event" : ""}">` +
        `<div class="tl-time">${esc(s.time)}</div>` +
        `<div class="tl-what">${esc(s.what)}</div>` +
        (s.detail ? `<div class="tl-detail">${esc(s.detail)}${s.link ? ` <a href="${esc(s.link)}" target="_blank" rel="noopener">Official source ↗</a>` : ""}</div>` : "") +
        `</div>`
      ).join("") + `</div>`;
    view.innerHTML = "";
    view.appendChild(card);
  }
  renderItineraries();

  /* ---------- events ---------- */
  const evList = $("#events-list");
  DATA.events.forEach((e) => {
    const c = el("div", "event-card");
    c.innerHTML =
      `<h3>${esc(e.name)}</h3>` +
      `<div class="meta"><b>${esc(e.date)}</b> · ${esc(e.time)} · ${esc(e.venue)} · ${esc(e.area)} · <b>${esc(e.price)}</b></div>` +
      `<p>${esc(e.status)}</p>` +
      `<div class="srcs">${srcLinks(e.sources)}</div>`;
    evList.appendChild(c);
  });
  const outList = $("#events-out-list");
  DATA.events_out_of_window.forEach((e) => {
    const c = el("div", "event-card out");
    c.innerHTML =
      `<h3>${esc(e.name)}</h3>` +
      `<div class="meta"><b>${esc(e.date)}</b></div>` +
      `<div class="srcs"><a href="${esc(e.source)}" target="_blank" rel="noopener">Official source ↗</a></div>`;
    outList.appendChild(c);
  });

  /* ---------- places ---------- */
  const placeAreaFilter = $("#area-filter");
  const placeSearch = $("#place-search");
  const placeTbody = $("#places-table tbody");

  DATA.places.forEach((p) => {
    const area = p.area.split(" / ")[0].trim();
    if (![...placeAreaFilter.options].some((o) => o.value === area)) {
      placeAreaFilter.appendChild(el("option", "", esc(area)));
    }
  });

  function renderPlaces() {
    const q = placeSearch.value.toLowerCase();
    const area = placeAreaFilter.value;
    placeTbody.innerHTML = "";
    DATA.places
      .filter((p) => (!area || p.area.includes(area)) && (!q || (p.name + p.area + p.hours + p.status).toLowerCase().includes(q)))
      .forEach((p) => {
        const tr = el("tr");
        tr.innerHTML =
          `<td class="name">${esc(p.name)}</td>` +
          `<td>${esc(p.area)}</td>` +
          `<td>${esc(p.hours)}</td>` +
          `<td>${esc(p.price)}</td>` +
          `<td>${esc(p.status)}</td>` +
          `<td>${srcLinks(p.sources)}</td>`;
        placeTbody.appendChild(tr);
      });
  }
  placeAreaFilter.addEventListener("change", renderPlaces);
  placeSearch.addEventListener("input", renderPlaces);
  renderPlaces();

  /* ---------- food ---------- */
  const foodAreaFilter = $("#food-area-filter");
  const foodSearch = $("#food-search");
  const foodTbody = $("#food-table tbody");

  DATA.food.forEach((f) => {
    const area = (f.area || "Other").split(",")[0].trim();
    if (![...foodAreaFilter.options].some((o) => o.value === area)) {
      foodAreaFilter.appendChild(el("option", "", esc(area)));
    }
  });

  function renderFood() {
    const q = foodSearch.value.toLowerCase();
    const area = foodAreaFilter.value;
    foodTbody.innerHTML = "";
    DATA.food
      .filter((f) => (!area || f.area.includes(area)) && (!q || (f.name + " " + f.area + " " + f.hours).toLowerCase().includes(q)))
      .forEach((f) => {
        const tr = el("tr");
        tr.innerHTML =
          `<td class="name">${esc(f.name)}</td>` +
          `<td>${esc(f.area)}</td>` +
          `<td>${esc(f.hours)}</td>` +
          `<td><a href="${esc(f.source)}" target="_blank" rel="noopener">Official listing ↗</a></td>`;
        foodTbody.appendChild(tr);
      });
  }
  foodAreaFilter.addEventListener("change", renderFood);
  foodSearch.addEventListener("input", renderFood);
  renderFood();

  /* ---------- sports ---------- */
  const sportsList = $("#sports-list");
  DATA.sports.forEach((s) => {
    const c = el("div", "sport-card");
    c.innerHTML =
      `<h3>${esc(s.league)}</h3>` +
      `<p>${esc(s.status)}</p>` +
      `<div class="srcs"><a href="${esc(s.source)}" target="_blank" rel="noopener">Official source ↗</a></div>`;
    sportsList.appendChild(c);
  });

  /* ---------- flags ---------- */
  const flagsList = $("#flags-list");
  DATA.flags.forEach((f) => {
    flagsList.appendChild(el("li", "", esc(f)));
  });

  /* ---------- sources ---------- */
  const liveChecks = $("#live-checks");
  const checks = [
    ["Busan X the Sky — operator page", "Confirmed live: daily 10:00–21:00; ₩29,000 adult / ₩26,000 child & senior; last ticket 20:30.", "https://www.busanxthesky.com/xthesky/xthesky.php", "ok"],
    ["SEA LIFE Busan — opening hours", "Confirmed live: Mon–Fri 10:00–19:00 (last entry 18:00); Sat–Sun 10:00–20:00 (last entry 19:00).", "https://www.visitsealife.com/busan/plan-your-visit/before-you-visit/opening-hours/", "ok"],
    ["Blueline Park — fares", "Confirmed live: Beach Train ₩10,000/₩14,000/₩16,000; Sky Capsule ₩50,000–₩60,000 per capsule; packages ₩73,000–₩111,000.", "https://www.bluelinepark.com/fare.do", "ok"],
    ["UN Memorial Cemetery — UNMCK", "Confirmed live: free; open 365 days; Oct–Apr 09:00–17:00.", "https://www.unmck.or.kr/eng/main/", "ok"],
    ["Gwangalli M Drone Light Show", "Confirmed: every Saturday; winter (Oct–Feb) 19:00 & 21:00; ~12 min; free; runs through Dec 31, 2026.", "https://www.gwangallimdrone.co.kr/", "ok"],
    ["National Gugak Center Busan — Gugak: Korea in Sound", "Confirmed live: Fri Nov 13, 19:30, Yeji-dang, ₩10,000; tickets from Oct 13, 2026 14:00; series to Nov 14.", "https://busan.gugak.go.kr/BG/contents/BG0101020000.do?prfmSn=6088&prfmDtSn=3&schM=view", "ok"],
    ["Busan IPark — K League 2 schedule", "Confirmed live: no home match Nov 9–16 (away Cheonan Nov 8; home vs Chungbuk Cheongju Nov 21).", "https://www.busanipark.com/match/match_schedule.php", "ok"],
    ["Busan Concert Hall — November calendar", "Confirmed live: no events Nov 9–16 (Nov 6–8 before stay; next event Nov 25).", "https://classicbusan.busan.go.kr/Home/ko/Main", "ok"],
    ["Busan Museum of Art / Space Lee Ufan", "Confirmed live: main building still closed (renovation; docent/parking suspended to Sep 16, 2026); Space Lee Ufan open Tue–Sun 10:00–18:00, closed Mon, free.", "https://art.busan.go.kr/index.nm", "ok"],
    ["Lotte World Adventure Busan", "Confirmed live: today 10:00–21:00; November hours date-specific — check park-schedule calendar.", "https://adventurebusan.lotteworld.com/", "warn"],
    ["KOVO volleyball fixtures", "2026–27 season opens Oct 31, 2026 (announced Aug 18, 2026); November home dates on JS-rendered pages — re-check in October.", "https://www.kovo.co.kr", "warn"],
    ["KBL / WKBL basketball fixtures", "2026–27 schedules published Aug 10, 2026; exact Nov home dates not statically retrievable — re-check in October.", "https://www.kbl.or.kr", "warn"],
    ["Busan Metro Line 2 station order", "Verified via rail.blue station list (Jangsan→Yangsan): Haeundae→Centum City 3 stops (Dongbaek, BEXCO); Haeundae→Daeyeon 10 stops; Haeundae→Gwangan 5 stops; Haeundae→Seomyeon 15 stops; Line 1 Seomyeon→Nampo 7 stops. Itinerary travel times are based on this.", "https://rail.blue/railroad/logis/stationinfo.aspx?id=600203", "ok"]
  ];
  const ul = el("ul", "check-list");
  checks.forEach(([label, note, url, cls]) => {
    const li = el("li");
    li.innerHTML =
      `<span class="${cls === "ok" ? "ok" : "warn"}">${cls === "ok" ? "✔" : "⚠"}</span> ` +
      `<b>${esc(label)}</b> — ${esc(note)} ` +
      `<a href="${esc(url)}" target="_blank" rel="noopener">official page ↗</a>`;
    ul.appendChild(li);
  });
  liveChecks.appendChild(ul);

  /* full source index */
  const srcTbody = $("#source-table tbody");
  const seen = new Set();
  const rows = [];
  const collect = (s) => { if (s && s.url && !seen.has(s.url)) { seen.add(s.url); rows.push(s); } };
  collect({ url: "https://english.visitbusan.net", label: "Visit Busan (official tourism portal)" });
  DATA.places.forEach((p) => p.sources.forEach(collect));
  DATA.events.forEach((e) => e.sources.forEach(collect));
  DATA.food.forEach((f) => collect({ url: f.source, label: f.name }));
  DATA.sports.forEach((s) => collect({ url: s.source, label: s.league }));
  DATA.events_out_of_window.forEach((e) => collect({ url: e.source, label: e.name }));
  rows.forEach((r, i) => {
    const tr = el("tr");
    tr.innerHTML = `<td>${i + 1}</td><td class="name">${esc(r.label || r.url)}</td><td><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)} ↗</a></td>`;
    srcTbody.appendChild(tr);
  });
})();
