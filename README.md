# Busan · L7 HAEUNDAE by LOTTE — Verified Travel Planner & Vlog Guide (Nov 9–16, 2026)

A line-by-line verified, interactive travel planner and vlog guide for a **7-night stay at L7 HAEUNDAE by LOTTE HOTELS BUSAN** (Check-in **Mon Nov 9, 2026** after 3:00 PM · Check-out **Mon Nov 16, 2026** before 11:00 AM).

**Live Website (GitHub Pages):** <https://buffedlizard55-lab.github.io/BusanL7HaeundaeLotteHotelStay/>

---

## 🌟 Highlights & Key Features

- **12 Verified Daily Itineraries** — Formulated with strict neighborhood clustering ("One Cluster per Day = Zero Backtracking") so travelers never waste hours in transit.
- **3 Curated 7-Day Complete Route Presets for Two Travelers**:
  1. **The Balanced Classic (Recommended)** — Harmonious alternation of high-energy exploration (Nampo, Seomyeon live concert, Saturday Yeongdo Bridge lift + Gwangalli Drone Show) and restorative beach / Spa Land days (3 Easy, 1 Moderate, 4 Busy).
  2. **Scenic Coastline & Ocean Vistas** — Emphasizes ocean cliff walks (Igidae, Oryukdo), seaside temples (Haedong Yonggungsa), marine cable cars (Songdo), and Blueline Sky Capsules.
  3. **Autumn Foliage, Heritage & Arts** — Anchored on mid-November peak autumn leaves at Beomeosa Mountain Temple, thousand-year Dongnae hot springs, traditional music concert at the National Gugak Center, and contemporary art exhibitions.
- **Interactive 7-Day Custom Trip Builder** — Allows the two travelers to customize their daily itinerary for each of the 8 stay dates, monitor the pace balance in real time, and print or export their tailored schedule.
- **Master Itinerary Comparison Table** — Searchable and filterable overview with pace tags, transit modes, cluster zones, highlights, and direct timeline triggers.
- **6 Verified In-Window Events** — 100% confirmed for Nov 9–16, 2026 (Turn Toward Busan ceremony, Culture Day cinema rates, Gugak concert, Yeongdo Bridge lift, Gwangalli Drone Show, F1963 Othoniel exhibition).
- **39 Verified Places & Activities** — Verified with operating hours, admission costs, subway exits, and direct official operator links.
- **150 Verified Restaurants & Cafés** — Sourced from the Koreafood verified database across 5 cuisine categories, verified against Visit Busan, VisitKorea, and the MICHELIN Guide 2026.
- **Duo Traveler Tools** — Daily sunset & golden hour timetable (Nov 9: 17:22 to Nov 16: 17:17), interactive 2-person admission budget estimator (KRW/USD), transit guidelines (T-Money, Naver Map), and emergency contacts.
- **Zero-Hallucination Verification Ledger** — 22+ live verification checks logged with timestamps and manual review links.
- **Print & PDF Mode** — Dedicated `@media print` styling for printing crisp, distraction-free travel booklets or saving to offline PDFs on mobile devices.

---

## 🛡️ Zero-Hallucination Policy

Every single itinerary, venue, transit estimate, opening hour, and event was verified line-by-line against primary trusted sources:

1. **Base Verification Repositories**:
   - [KoreaFun — Events & Activities](https://github.com/karagemop466-tech/KoreaFun) (`busan.md`, 51 entries, audited August 2026)
   - [Koreafood — Restaurants & Cafés](https://github.com/karagemop466-tech/Koreafood) (`cities/busan.md`, 109+ verified rows; **150 eateries** in this planner's directory, audited August 2026)
   - [Koreafood Live Portal](https://karagemop466-tech.github.io/Koreafood/)
2. **Live Operator Re-Verification (Aug 30–31, 2026)**:
   - Official municipal pages fetched and verified for Busan X the Sky, SEA LIFE Busan, Blueline Park, UN Memorial Cemetery, National Gugak Center, Gwangalli M Drone Light Show, Yeongdo Bridge lift, Shinsegae Spa Land, and F1963.
3. **Transparent Flags**:
   - Unreleased sports fixtures (KOVO, KBL, WKBL) and date-specific park calendars (Lotte World Adventure Busan) are explicitly flagged for re-checking in October 2026 rather than hallucinated.

See [`VERIFICATION-NOTES.md`](VERIFICATION-NOTES.md) for the complete line-by-line ledger.

---

## 📁 Repository Structure

```
├── index.html            # Single-page travel vlog & itinerary web portal
├── styles.css            # Responsive travel blog styling with print optimization
├── app.js                # Data-driven interactive application (builder, calculator, filters)
├── data.json             # Complete verified dataset (itineraries, places, food, events, clusters)
├── VERIFICATION-NOTES.md # Detailed line-by-line verification log & official URLs
├── README.md             # Project documentation & travel guide overview
└── .nojekyll             # GitHub Pages static routing marker
```

---

## 🚇 Neighborhood Transit Summary (From L7 Haeundae Base)

Eight neighborhood clusters — one cluster per day means zero backtracking:

- **Cluster 1: Haeundae Beach & Mipo** — 0–15 min walk from hotel.
- **Cluster 2: Centum City & BEXCO** — 3 stops on Metro Line 2 (~8 min).
- **Cluster 3: Gwangalli Beach & Suyeong / Millak** — 6 stops on Metro Line 2 (~12 min).
- **Cluster 4: Daeyeon & Nam-gu (UNMCK / Igidae)** — 8–10 stops on Metro Line 2 (~20–25 min).
- **Cluster 5: Seomyeon & Jeonpo (Central Busan)** — 16 stops on Metro Line 2 (~28 min direct).
- **Cluster 6: Nampo, Jagalchi & Yeongdo (Old Town)** — Line 2 to Seomyeon + Line 1 to Nampo (~45 min).
- **Cluster 7: Dongnae & Geumjeongsan (Beomeosa)** — Line 2 to Seomyeon + Line 1 North (~45–50 min).
- **Cluster 8: Gijang Coast (Osiria & Temple)** — Express Bus 1001 / Bus 181 or taxi (~25–35 min).

> West-Busan days (Gamcheon, Songdo, Eulsukdo, Dadaepo) are covered by itineraries I11 / the place directory and are reached via the Nampo cluster's Line 2 + Line 1 ride plus a short bus/taxi hop — they are route days, not separate clusters.

---

## 💻 Local Development

```bash
# 1) (After editing data.json) rebuild index.html with the inline dataset:
python3 tools/build-site.py

# 2) Serve locally
python3 -m http.server 8080 --bind 0.0.0.0
# Open http://localhost:8080 in your browser
```

> **Why the dataset is inline:** the app reads its data from `<script id="site-data" type="application/json">`.
> It MUST be inline — an external `<script src="data.json" type="application/json">` never exposes its
> fetched content via `textContent`, which previously crashed `app.js` (`JSON.parse("")`) and left the
> whole page blank. `tools/build-site.py` keeps `index.html` and `data.json` in sync.

---

## 🔗 Official Verification Links for Manual Review

- **Visit Busan Official Tourism Portal:** <https://english.visitbusan.net>
- **L7 HAEUNDAE by LOTTE HOTELS:** <https://www.lottehotel.com/haeundae-l7/en/>
- **UN Memorial Cemetery (UNMCK):** <https://www.unmck.or.kr/eng/main/>
- **National Gugak Center Busan:** <https://busan.gugak.go.kr/>
- **Gwangalli M Drone Light Show:** <https://www.gwangallimdrone.co.kr/>
- **Busan X the Sky:** <https://www.busanxthesky.com/>
- **Blueline Park (Sky Capsule / Beach Train):** <https://www.bluelinepark.com/>
- **Shinsegae Centum Spa Land:** <https://www.shinsegae.com/store/entertainment/centum-spaland.do?storeCd=SC00008>
- **F1963 Cultural Complex (Othoniel Exhibition):** <https://www.f1963.org/ko/?c=art&s=1&gbn=viewok&ix=496>
- **Songdo Marine Cable Car:** <http://busanaircruise.co.kr>
- **Beomeosa Temple:** <https://www.beomeo.kr>
