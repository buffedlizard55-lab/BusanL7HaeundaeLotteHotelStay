# Busan · L7 HAEUNDAE by LOTTE — Verified Stay Planner (Nov 9–16, 2026)

A clean, source-linked itinerary planner for a 7-night stay at **L7 HAEUNDAE by LOTTE HOTELS, Busan**
(check-in **Mon Nov 9, 2026** after 3:00 PM · check-out **Mon Nov 16, 2026** before 11:00 AM).

**Live site (GitHub Pages):** <https://buffedlizard55-lab.github.io/BusanL7HaeundaeLotteHotelStay/>

---

## What this is

- **9 day-by-day itineraries** — a mix of busy days (Nampo + Yeongdo Bridge lift + Gwangalli drone show; Seomyeon + Gugak concert) and easy/rest days (Spa Land, beach walks) — built so each day stays in **one walking cluster** around the hotel.
- **5 dated events verified inside the stay window** (Nov 11 Turn Toward Busan, Culture Day, Nov 13 Gugak concert, Nov 14 Yeongdo Bridge lift + drone show).
- **39 verified places/activities** and **150 verified restaurants & cafés**, each with an official source link.
- **Flags & re-checks section** — everything that could not be fully verified (KOVO/KBL November fixtures, Lotte World November hours, BMA reopening) is explicitly flagged, never presented as fact.

## No-hallucination policy

Every entry was checked line-by-line against official sources:

1. **Base verification repos** (audited Aug 17–21, 2026, with a line-level ledger):
   - [KoreaFun — events & activities](https://github.com/karagemop466-tech/KoreaFun) (`busan.md`, 51 entries)
   - [Koreafood — restaurants & cafés](https://github.com/karagemop466-tech/Koreafood) (`cities/busan.md`)
2. **Live re-verification on Aug 30, 2026** — official operator/city pages fetched and checked for every date-critical claim (X the Sky, SEA LIFE, Blueline fares, UNMCK, Busan IPark schedule, Busan Concert Hall calendar, Gugak Center, drone show, BMA).
3. Anything not retrievable from an official page is marked **⚠️ re-check** with the official link, never guessed.

See [`VERIFICATION-NOTES.md`](VERIFICATION-NOTES.md) for the full line-by-line log.

## Repository contents

| File | Purpose |
|---|---|
| `index.html` | Single-page UI (tabs: Itineraries · Events · Places · Food · Sports · Flags · Sources) |
| `styles.css` | Clean responsive styling |
| `app.js` | Data-driven rendering |
| `data.json` | All verified data (events, places, food, itineraries, flags, sources) |
| `VERIFICATION-NOTES.md` | Line-by-line verification log with dates and source URLs |
| `.nojekyll` | Serve as static site on GitHub Pages |

## How to run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Official sources (start here for manual review)

- Visit Busan — https://english.visitbusan.net
- KoreaFun verified Busan file — https://github.com/karagemop466-tech/KoreaFun/blob/main/busan.md
- Koreafood verified Busan file — https://github.com/karagemop466-tech/Koreafood/blob/main/cities/busan.md
- UN Memorial Cemetery — https://www.unmck.or.kr/eng/main/
- National Gugak Center Busan — https://busan.gugak.go.kr/
- Gwangalli M Drone Light Show — https://www.gwangallimdrone.co.kr/
- Busan X the Sky — https://www.busanxthesky.com/
- Blueline Park — https://www.bluelinepark.com/
- SEA LIFE Busan — https://www.visitsealife.com/busan/
- Busan IPark (K League 2) — https://www.busanipark.com/
- Busan Concert Hall — https://classicbusan.busan.go.kr/
- Lotte World Adventure Busan — https://adventurebusan.lotteworld.com/

**Re-verify in October 2026:** KOVO (kovo.co.kr), KBL (kbl.or.kr), WKBL (wkbl.or.kr), Lotte World November hours, BMA reopening (art.busan.go.kr), MoCA notice board (busan.go.kr/moca_en).
