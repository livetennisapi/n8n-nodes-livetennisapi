# Changelog

## 0.2.0 — 2026-08-07

- **New resources.** H2H (`/h2h` — the record between two players across the
  1968–2022 results archive and completed matches from 2023 on; BASIC or any
  History plan), Archive (`/history/archive/matches`,
  `/history/archive/matches/{id}`, `/history/archive/players`,
  `/history/archive/career` — deep historical results, bios and career
  aggregates; BASIC or any History plan) and Ranking (rank-ordered listing on
  PRO; per-player point-in-time records on ULTRA).
- **Match → Get Statistics.** In-play statistics for one match — aces, double
  faults, serve split, hold/break percentages (ULTRA).
- **Match → Get Many filters.** New Country, From/To date and Player ID
  filters alongside the existing Tour filter. Unknown filter values are a
  400, never silently ignored.
- **Friendlier API errors.** Daily-quota 429s now surface `resets_at` (the
  absolute reset instant) and the daily limit in the error message;
  `abuse_throttled` 429s explain the 24-hour block and convert
  `retry_at_epoch` to an ISO time; per-minute 429s carry the `Retry-After`
  value; 403 `upgrade_required` names the tier that unlocks the operation and
  where to upgrade.
- **Quota grid re-set (2026-08-06, upstream).** FREE is now **100
  requests/day** (was 1,000 when 0.1.2 was written — the 0.1.2 entry below
  describes the old grid), BASIC 1,000/day, PRO 10,000/day, ULTRA
  500,000/day. All quota copy in the README and node updated.
- License holder corrected to Live Tennis API. Docs links now point at
  docs.livetennisapi.com. `dist/` is no longer tracked in git — the release
  workflow builds it at publish time. Added `scripts/truthcheck.sh` and a CI
  step pinning product facts.

## 0.1.2 — 2026-08-02

- **Docs — corrected tier information.** Bulk completed-match paging
  (Match → Get Many with Status = Completed) is not a rate-limit concern but a
  tier wall: it returns `403 upgrade_required` on a FREE key and needs the
  BASIC tier ($9.99/mo) or any History plan. Fetching a single completed match
  by ID stays free. The Completed option in the node now carries the tier
  hint.
- **Docs — daily quota.** Return All issues one request per page, so besides
  the per-minute 429 risk it can exhaust the FREE tier's 1,000 requests/day
  cap on repeated runs over big result sets.
- `package.json` author is now Live Tennis API <hello@livetennisapi.com>.

## 0.1.1 — 2026-07-24 (unreleased)

- Publish via GitHub Actions with npm provenance.

## 0.1.0 — 2026-07-24

- Initial release: Match (Get Many / Get / Get Score), Player (Search / Get),
  Fixture (Get Many) and Status (Get) operations with an X-API-Key credential.
