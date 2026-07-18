# Web Frontend — Development Rules

Rules for the React/TypeScript frontend (`web/`). These complement the project-level `CLAUDE.md`.

## Hook Interface

All API hooks return `{ data, loading, error }` — no exceptions, no field renaming.

```typescript
// CORRECT
function useMyData(slug: string) {
  return useApiData<MyDataType>(`/api/${slug}/my-endpoint`);
  // returns { data: MyDataType | null, loading: boolean, error: string | null }
}

// WRONG — do not rename fields
function useMyData(slug: string) {
  const { data: myData, ... } = useApiData(...);  // ← breaks the consistent interface
}
```

New hooks go in `web/src/api/hooks.ts`. New types go in `web/src/api/types.ts`.

## Types Live in `api/types.ts`

Never define or export a TypeScript `interface` or `type` inside a component file. If a component needs a type, it belongs in `web/src/api/types.ts`.

```typescript
// WRONG — type defined in component
// web/src/components/draft/DraftPage.tsx
interface TeamProfileResponse { ... }  // ← move this to types.ts

// CORRECT
// web/src/api/types.ts
export interface TeamProfileResponse { ... }

// web/src/components/draft/DraftPage.tsx
import type { TeamProfileResponse } from "../../api/types";
```

## Design Tokens

This is an editorial "light paper" design system (warm paper background, ink text,
Fraunces display serif, hairline rules). Design tokens live in `src/index.css` under
`@theme` (`--color-paper`, `--color-raised`, `--color-ink`, `--color-ink-soft`,
`--color-ink-faint`, `--color-rule`, `--color-accent`, `--color-win`, `--color-loss`) plus
reusable editorial primitives (`.card-editorial`, `.eyebrow`, `.section-rule`, `.tab-btn`
/ `.tab-btn-active`, `.toggle-group` / `.toggle-btn-active`, `.badge-*`, `.item-card`,
etc.). Never hardcode `gray-*`, `bg-white`, or raw hex grays in a component — use the
token classes so the palette stays swappable in one place. The `lab/` and `draft/`
surfaces (internal analytics tools) get the same neutral-gray→token treatment but keep
`blue-*` as intentional "tool chrome" — that allowance does not extend to the rest of the
site.

## Image Error Handling

Every `<img>` with a dynamic or external `src` must have an `onError` handler.

```tsx
// CORRECT
<img
  src={dynamicUrl}
  alt={alt}
  onError={(e) => { e.currentTarget.style.display = "none"; }}
/>
```

Static local assets (in `public/`) do not need onError handlers.

## New Pages

When adding a new page route:
1. Add lazy import in `App.tsx`: `const MyPage = React.lazy(() => import("./components/my/MyPage"))`
2. A single top-level `<Suspense fallback={<LoadingSpinner />}>` in `App.tsx` already wraps
   all routes — that's the route-chunk-load spinner and does not need repeating per page.
3. League pages (`/{slug}`, `/{slug}/matchups`, `/{slug}/standings`, `/{slug}/articles`,
   `/{slug}/history`) render inside `league/LeagueLayout.tsx`, which owns the masthead
   title, tagline, and the section nav bar (`SECTIONS` array — This Week / Matchups /
   Standings / Articles / History). Add a new league section there, not in a one-off
   layout. Non-league detail pages (article, franchise) render their own
   `<Breadcrumbs items={[...]} />` (`layout/Breadcrumbs.tsx`) at the top of the page body.
4. Always show `<ErrorBanner message={error} />` when the hook returns an error.
5. For in-page data loading (after the route chunk has already loaded), use
   `<Skeleton className="..." />` (`shared/Skeleton.tsx`) shaped to the content being
   replaced — see `StandingsPage.tsx` / `MatchupsPage.tsx` / `LeagueHubPage.tsx` for the
   pattern. Reserve the plain `<LoadingSpinner />` for the router-level Suspense fallback
   and for small inline waits (e.g. a sidebar panel).
6. `utils/league-config.ts` (`LEAGUES`, `leagueBySlug`, `leagueBySportCode`,
   `defaultScoringMode`) is the single source of truth for slug↔sport-code↔scoring-mode
   mapping and taglines. Don't hardcode `"baseball"`/`"basketball"` or `"mlb"`/`"nba"`
   branches elsewhere — read or extend this module instead.

## Verification Before Commit

```bash
cd web
npx tsc -b
npm test
```

Zero TypeScript errors and a green `vitest run` before committing. No exceptions.
Use `tsc -b`, NOT plain `tsc --noEmit`: the root tsconfig is a solution file with
no inputs, so `--noEmit` type-checks nothing and passes vacuously (caught
2026-07-18 — a missing import sailed through it; only `tsc -b`, which
`npm run build` also runs, flagged it).
(`npm test` runs `vitest run --passWithNoTests`; specs live next to the module they
cover, e.g. `utils/league-config.test.ts`, `utils/records-helpers.test.ts`.)

## Access Gating

There is no league-level password gate — league pages (`/{slug}/...`) are public. Only
the lab (`/lab/...`) is gated, via `layout/PasswordGate.tsx` wrapping `LabRootLayout`.
Don't reintroduce a gate on league routes without an explicit product decision.

## CLAUDE.md Update Rule

When making code changes, update this file if:
- The hook interface contract changes (new return shape, new field conventions)
- A new component pattern is established (new shared component location, new routing pattern)
- The type placement rule is extended or a new type file is introduced
- A new `<img>` handling pattern replaces `onError`
- A design token or editorial primitive is added/renamed in `index.css`

## Doc placement (digest)

Durable docs → this repo's `docs\` (committed, update-in-place, linked from
CLAUDE.md). Specs/plans/state → the umbrella `work\` (local-only, never
committed): specs in `..\work\specs\`, current state in `..\work\STATE.md`.
Full policy: `..\..\POLICIES.md`.
