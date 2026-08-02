# Changelog

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
