# BUILD_PLAN — n8n-nodes-livetennisapi

## Build target & source of truth
- Target: n8n community node package `n8n-nodes-livetennisapi` (declarative-style, verified-track
  constraints from day one). Greenfield, standalone git repo at
  `/var/tmp/n8n-build/n8n-nodes-livetennisapi`.
- Source of truth: the launching ticket (fully-specified spec: operations, credential name,
  constraints, verification steps) + OpenAPI at
  `/home/ben/Documents/ben-is-a-dev/livetennisapi-oss/openapi/openapi.yaml` (read fully) +
  current n8n docs (fetched 2026-07-24: verification-guidelines, submit-community-nodes) +
  current `n8n-io/n8n-nodes-starter` layout (fetched, uses `@n8n/node-cli`).
- Build/verify only: NO npm publish, NO GitHub repo, key NEVER committed.

## Summary
Ready to build as specified. [FACT] API is pure REST GETs → declarative style fits (ticket's own
judgment, confirmed against the spec). [FACT] Current starter uses `@n8n/node-cli`
(`n8n-node build|lint`), eslint 9 flat config `@n8n/node-cli/eslint` (which wraps
`eslint-plugin-n8n-nodes-base`), no gulpfile. [FACT] Verified track: zero runtime deps, MIT,
English-only, `npx @n8n/scan-community-package` must pass, GitHub-Actions provenance publish
required for Creator-Portal submission since 2026-05-01.
Top risks: (1) declarative offset-pagination stop condition — verify at runtime, not assume;
(2) in-n8n execution may be infeasible in this env (n8n is a huge install) → fallback per ticket:
direct invocation of request wiring against live API, in-n8n test marked NOT DONE;
(3) `/fixtures` may return finished/empty (known upstream bug) — pass through, document in README.

## Build units (ordered)
### [BUILD-001] Scaffold package (starter-conformant)
- Delivers: git repo; package.json (name `n8n-nodes-livetennisapi`, keyword
  `n8n-community-node-package`, `n8n` block, zero runtime deps, devDeps per starter);
  tsconfig.json, eslint.config.mjs, .prettierrc.js, .gitignore, LICENSE.md (MIT), README.md,
  .github/workflows/{ci,publish}.yml (starter's provenance workflow), icons/livetennisapi.svg
  (from brand/logo.svg — already a clean self-contained 48x48 tennis-ball SVG, dark-tile works on
  both themes). Depends-on: none.
- Acceptance: `npm install` (TMPDIR=/var/tmp/n8n-build/tmp) succeeds; `git log` shows commit.
- Output strategy: one-shot (all small config files). Becomes commit BUILD-001.

### [BUILD-002] Credentials `liveTennisApiApi`
- Delivers: `credentials/LiveTennisApiApi.credentials.ts` — API key (password field), generic
  auth injecting `X-API-Key`, credential test = GET /matches?limit=1. Depends-on: BUILD-001.
- Files: credentials/LiveTennisApiApi.credentials.ts. Convention: starter
  `GithubIssuesApi.credentials.ts` shape.
- Acceptance: `npm run build` + `npm run lint` green. Becomes commit BUILD-002.

### [BUILD-003] Node `LiveTennisApi` (declarative)
- Delivers: `nodes/LiveTennisApi/LiveTennisApi.node.ts` + codex `.node.json` + per-resource
  description modules (`resources/{match,player,fixture,status}.ts`).
  Resources/ops: Match: Get Many (status live|upcoming|completed, tour filter enum
  atp|wta|challenger|itf|juniors, Return All + Limit w/ offset pagination), Get (by ID),
  Get Score; Player: Search, Get; Fixture: Get Many (tour, pagination); Status: Get (/health).
  List responses unwrap `data` via rootProperty postReceive. Live-data truths respected:
  response `tour`/points/server/data_completeness passed through opaque (node never parses them);
  filter enum is exactly the 5 grouped values.
- Depends-on: BUILD-002. Acceptance: build + lint green. Strategy: staged (outline
  resource files, fill, re-read each). Becomes commit BUILD-003.

### [BUILD-004] Package verification
- Delivers: green `npm run lint`, `npm run build`, `npm pack` tarball inspected (dist js/maps/
  svg/codex present, no src leaks, sane size), `npx @n8n/scan-community-package` if runnable
  offline-tolerant. Acceptance: all green, tarball listing captured. Becomes commit BUILD-004
  (README finalization + any lint fixes).

### [BUILD-005] Live verification (no product code)
- Attempt real n8n: install n8n into /var/tmp/n8n-build/n8n-runtime, `n8n import:credentials`
  (key from env, file in scratchpad only), `n8n execute --file workflow.json` exercising every
  op against live API. If infeasible → ticket fallback: drive the built node's declarative
  routing directly / raw requests mirroring node wiring; mark in-n8n NOT DONE.
- Acceptance: captured live responses per op (or explicit NOT DONE + fallback evidence).

### [BUILD-006] Key-leak sweep + report
- `git grep` for key = 0 hits (also grep working tree + tarball). Final report in-message.

## Conventions to follow
- Starter layout/`@n8n/node-cli` scripts: `starter/package.json` (fetched copy at
  /var/tmp/n8n-build/starter). eslint flat config: starter/eslint.config.mjs:1-3.
- Credential shape: starter/credentials/GithubIssuesApi.credentials.ts:9-45.
- Declarative routing (options-level `routing.request`, `send`, pagination, displayOptions):
  starter/nodes/GithubIssues/resources/issue/{index,getAll}.ts.
- Codex file: starter/nodes/GithubIssues/GithubIssues.node.json.
- Prettier: tabs, single quotes, printWidth 100 (starter/.prettierrc.js).

## Open questions & assumptions
- [ASSUMPTION][blocking→resolved by ticket] Ticket = approved plan; scope is exactly the listed
  ops (no events/markets/history/analysis ops — those are paid tiers; out of scope).
- [ASSUMPTION] Declarative `offset` pagination stops on short page — verified in BUILD-005, else
  documented.
- [ASSUMPTION] Single icon (dark-tiled) acceptable for light+dark themes.
- [ASSUMPTION] `usableAsTool: true` (starter default) is desirable — kept.

## Handoff
Build, then `/full-review`. Most relevant personas: `/code-logic-review` (routing/pagination),
`/security-audit` (credential handling, key hygiene), `/qa-automation` (live-op matrix).

## Status ledger
- BUILD-001 pending
- BUILD-002 pending
- BUILD-003 pending
- BUILD-004 pending
- BUILD-005 pending
- BUILD-006 pending
