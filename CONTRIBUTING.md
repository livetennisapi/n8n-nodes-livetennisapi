# Contributing to n8n-nodes-livetennisapi

This is a declarative-style n8n community node. The Live Tennis API is plain
REST with GET requests only, so every operation is routing config. There is no
`execute()` method.

## Setup

Node.js 20.15 or later.

```bash
npm ci
npm run lint      # n8n-node lint (the n8n community-node ESLint rules)
npm run build     # n8n-node build, output in dist/
npm run dev       # n8n-node dev, runs a local n8n with this node loaded
sh scripts/truthcheck.sh
```

CI runs `truthcheck.sh`, `npm run lint` and `npm run build` on every pull
request. All three must pass.

## Layout

The repo follows the official `n8n-io/n8n-nodes-starter` layout and its
`@n8n/node-cli` scripts.

- `credentials/LiveTennisApiApi.credentials.ts` holds the API key credential.
  It sends the key as the `X-API-Key` header.
- `nodes/LiveTennisApi/LiveTennisApi.node.ts` is the node itself.
- `nodes/LiveTennisApi/resources/` has one file per resource. `shared.ts` holds
  `handleApiErrors`, which turns the API's 429 and 403 bodies into readable
  n8n errors.

## Rules for changes

- **No runtime dependencies.** n8n's verified-node track requires it. Put
  build tooling in `devDependencies` only.
- **Run `handleApiErrors` first.** Every operation sets
  `ignoreHttpStatusErrors: true` and runs `handleApiErrors` as its first
  `postReceive` step. Without it a 429 surfaces as a bare status code.
- **Do not unwrap `data` twice.** List operations unwrap the response with a
  `rootProperty` step in `postReceive`. The offset `pagination` block must not
  add its own `rootProperty`. A second unwrap breaks "Return All".
- **Pass API fields through as they are.** The node does not parse `tour`,
  points, `server` or `data_completeness`. Users get what the API sends.
- **Formatting** follows `.prettierrc.js`: tabs, single quotes, 100 columns.

## Releases

Pushing a `v*.*.*` tag runs `.github/workflows/release.yml`. It builds and
publishes to npm with a provenance attestation, which n8n requires for
community nodes. API details are at <https://docs.livetennisapi.com>.
