# n8n-nodes-livetennisapi

This is an n8n community node for the [Live Tennis API](https://livetennisapi.com) — real-time
tennis scores, match data, player profiles and upcoming fixtures across ATP, WTA, Challenger,
ITF and junior tours.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/)
workflow automation platform.

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Usage notes](#usage-notes)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)
in the n8n community nodes documentation. The package name is `n8n-nodes-livetennisapi`.

## Credentials

Sign up for a free API key (1000 requests/day, 30/minute, no card) at
[livetennisapi.com/subscribe/free](https://livetennisapi.com/subscribe/free).

Create a **Live Tennis API** credential in n8n and paste the key. The node sends it as an
`X-API-Key` header. The credential test performs a one-match list request.

## Operations

### Match
- **Get Many** — list matches by lifecycle status (`live`, `upcoming`, `completed`), with an
  optional tour filter (`atp`, `wta`, `challenger`, `itf`, `juniors`) and pagination.
- **Get** — full detail for one match by ID (includes `market` on PRO plans and `analysis` on
  ULTRA plans; those embeds are absent on lower tiers).
- **Get Score** — the current score only, the lowest-latency REST read.

### Player
- **Search** — search players by name (ranked players first).
- **Get** — one player's bio, ranking and cached stats by player ID.

### Fixture
- **Get Many** — upcoming scheduled fixtures (name-only; players not yet resolved to IDs), with
  an optional tour filter and pagination.

### Status
- **Get** — API liveness probe (`/health`).

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
- A `403` with `{"error":"upgrade_required"}` means the endpoint or embed needs a higher plan
  tier, not that your key is invalid.
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
  matches can span thousands of records) can exhaust the FREE tier's **1,000 requests/day**
  cap. Prefer **Limit** with an explicit value on large buckets, or use a higher plan tier.

## Compatibility

Requires n8n 1.x. Built declaratively with zero runtime dependencies.

## Resources

- [Live Tennis API documentation](https://livetennisapi.com)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Affiliate program

Know developers who need tennis data? The [affiliate program](https://affiliates.livetennisapi.com/program) pays 51% recurring commission for the life of every referred subscription — 30-day cookie, and the people you refer get 10% off.
