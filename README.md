# n8n-nodes-livetennisapi

[![CI](https://github.com/livetennisapi/n8n-nodes-livetennisapi/actions/workflows/ci.yml/badge.svg)](https://github.com/livetennisapi/n8n-nodes-livetennisapi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/n8n-nodes-livetennisapi)](https://www.npmjs.com/package/n8n-nodes-livetennisapi)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

This is an n8n community node for the [Live Tennis API](https://livetennisapi.com) — real-time
tennis scores, match data, player profiles, fixtures, rankings, head-to-head records and a
1968–2022 results archive across all 5 tours: ATP, WTA, Challenger, ITF and juniors.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/)
workflow automation platform.

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Quotas and rate limits](#quotas-and-rate-limits)
- [Authentication details](#authentication-details)
- [Usage notes](#usage-notes)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)
in the n8n community nodes documentation. The package name is `n8n-nodes-livetennisapi`.

In short: **Settings → Community Nodes → Install**, enter `n8n-nodes-livetennisapi`, and
restart if prompted. The **Live Tennis API** node then appears in the node picker.

## Credentials

Sign up for a free API key (100 requests/day, 30/minute, no card) at
[livetennisapi.com/subscribe/free](https://livetennisapi.com/subscribe/free).

Create a **Live Tennis API** credential in n8n and paste the key (it looks like
`twjp_...`). The node sends it as an `X-API-Key` header. The credential test performs a
one-match list request.

## Operations

| Resource | Operation | Endpoint | Plan |
|---|---|---|---|
| Match | Get Many | `/matches` | FREE — `Status = Completed` needs BASIC or any History plan |
| Match | Get | `/matches/{id}` | FREE — `market` embed at PRO, `analysis` embed at ULTRA |
| Match | Get Score | `/matches/{id}/score` | FREE |
| Match | Get Statistics | `/matches/{id}/statistics` | ULTRA |
| Player | Search | `/players` | FREE |
| Player | Get | `/players/{id}` | FREE |
| Fixture | Get Many | `/fixtures` | FREE |
| H2H | Get | `/h2h` | BASIC, or any History plan — per-player stats block at ULTRA |
| Archive | Get Many Matches | `/history/archive/matches` | BASIC, or any History plan |
| Archive | Get Match | `/history/archive/matches/{id}` | BASIC, or any History plan |
| Archive | Get Many Players | `/history/archive/players` | BASIC, or any History plan |
| Archive | Get Career | `/history/archive/career` | BASIC, or any History plan |
| Ranking | Get Many (rank-ordered listing) | `/rankings?system=` | PRO |
| Ranking | Get for Player (point-in-time records) | `/rankings?player=` | ULTRA |
| Status | Get | `/health` | no key needed |

Notes on the less obvious ones:

- **Match → Get Many** takes filters for tour (`atp`, `wta`, `challenger`, `itf`,
  `juniors`), country (3-letter IOC-style code), a from/to date window, and a player ID.
  Unknown filter values are a `400`, never silently ignored.
- **H2H** and **Archive → Get Career** are keyed by *name fragments* (min 3 characters) —
  archive people have no roster IDs. An ambiguous fragment is refused with the candidate
  list rather than summing two people into one record.
- **Archive** covers ATP and WTA results 1968–2022 (1968-onward main draws, qualifying,
  challengers and futures). It is a separate ID space from live matches and ends where the
  API's own point-by-point coverage begins (2023).
- **Ranking → Get Many** lists exactly one system per call (`atp`, `wta`, `itf_jt`,
  `itf_mt`, `itf_wt`); UTR has no listing (it is a rating, not a ranking) and is read per
  player. **Get for Player** answers "what was the ranking *as of* a date" — everywhere
  else the API joins today's rank.

## Quotas and rate limits

| Plan | Per minute | Per day | Price |
|---|---|---|---|
| FREE | 30 | 100 | $0 |
| BASIC | 60 | 1,000 | $9.99/mo |
| PRO | 300 | 10,000 | $29.99/mo |
| ULTRA | 600 | 500,000 | $99.99/mo |

- On a FREE key (100 requests/day), poll no faster than every **15 minutes**. For an
  always-on dashboard, **BASIC is the recommended floor**.
- Every response carries `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`
  headers; 429s carry `Retry-After`.
- The node turns API errors into actionable n8n errors instead of bare status codes:
  - **Daily 429** — the error shows the daily limit and `resets_at`, the absolute ISO
    instant the quota resets (trust that instant, not an assumed fixed UTC boundary).
  - **429 `abuse_throttled`** — keys that keep hammering the API after the cap is spent
    are blocked for 24 hours; the error converts `retry_at_epoch` to an ISO time and says
    to fix the retry loop (add a Wait node, back off on 429s).
  - **Per-minute 429** — the error carries the `Retry-After` seconds.
  - **403 `upgrade_required`** — the error names the tier that unlocks the operation and
    where to upgrade. It does not mean your key is invalid.

## Authentication details

The API accepts `Authorization: Bearer <key>` (preferred for new integrations) and
`X-API-Key: <key>`. This node sends `X-API-Key`. Keys are prefixed `twjp_`. Only
`/health` is unauthenticated.

## Usage notes

These reflect real behaviour of the live feed — the node passes the data through untouched:

- `score.points` are **strings** (`"0"`, `"15"`, `"30"`, `"40"`, `"AD"`), not numbers.
- `score.server` is `null` on roughly 7% of live reads — handle the null.
- `score.games` is `[games_p1, games_p2]`, where each entry is a **per-set array** that grows
  as the match progresses.
- `data_completeness.known` / `.of` are `null` for doubles teams (with an explanatory `note`) —
  `null` means "not applicable", which is distinct from `0`.
- The `tour` field **on a response record** is granular (`challenger_men`, `juniors_girls`) and
  uppercase for doubles teams (`ATP`). It is an opaque label — it is not the same vocabulary as
  the `tour` **filter**, which accepts exactly `atp`, `wta`, `challenger`, `itf`, `juniors` and
  returns a 400 on anything else.
- Fixture **Get Many** may occasionally include already-finished fixtures or return an empty
  list (a known upstream quirk); the node passes the response through as-is.
- Bulk completed-match paging (**Get Many** with Status = `completed`) is **not available on
  the FREE tier at all** — it returns a `403 upgrade_required`. It needs the **BASIC** tier
  ($9.99/mo) or **any History plan** — upgrade at
  [livetennisapi.com/subscribe/upgrade](https://livetennisapi.com/subscribe/upgrade). Fetching
  a single completed match by ID with **Get** stays free.
- **Return All** pages through results 200 at a time with no delay between pages — one API
  request per page. On a large bucket that can hit the per-minute rate limit mid-pagination
  and fail with a 429, and repeated **Return All** runs over big result sets (completed
  matches can span thousands of records) can exhaust the FREE tier's **100 requests/day**
  cap. Prefer **Limit** with an explicit value on large buckets, or use a higher plan tier.
- Archive serve statistics exist from **1991** onward only; earlier rows have `stats: null`
  (the era never recorded them — nothing is synthesised).

## Compatibility

Requires n8n 1.x. Built declaratively with zero runtime dependencies.

## Resources

- [Live Tennis API documentation](https://docs.livetennisapi.com)
- [Get a free API key](https://livetennisapi.com/subscribe/free)
- [Live Tennis API Discord](https://discord.gg/f8WUZHgDm6)
- [Live Tennis API on GitHub](https://github.com/livetennisapi)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Affiliate program

Know developers who need tennis data? The [affiliate program](https://affiliates.livetennisapi.com/program) pays 51% recurring commission for the life of every referred subscription — 30-day cookie, and the people you refer get 10% off.

## License

[MIT](LICENSE.md) © Live Tennis API
