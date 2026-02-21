# Fantasy Analytics Web

React frontend for the fantasy sports analytics platform. Displays league data served by the FastAPI backend: season recaps, power rankings, manager history, all-time records, franchise profiles, and weekly articles.

## Stack

- **React 19** + TypeScript
- **Vite** (dev server + build)
- **Tailwind CSS v4**
- **React Router v7** (client-side routing)

## Local Dev

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Requires the API running at `http://localhost:8000` (see `api/README.md`).

The dev proxy is configured in `vite.config.ts`; API requests to `/api/*` are forwarded to the backend automatically.

## Build & Deploy

```bash
npm run build      # outputs to dist/
```

Deploys to GitHub Pages (`paulsuk.github.io`) via GitHub Actions on push to master. `dist/404.html` is a copy of `dist/index.html` to support SPA deep-link routing.

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Franchise selector |
| `/:slug` | `SportLayout` → `SportPage` | Season overview: standings, power rankings, matchups, articles |
| `/:slug/records` | `RecordsPage` | All-time records, manager history, H2H matrix |
| `/:slug/articles` | `ArticlesPage` | Full article archive |
| `/:slug/articles/:id` | `ArticlePage` | Article detail + standings sidebar |
| `/:slug/franchise/:id` | `FranchiseDetailPage` | Franchise profile: seasons, rosters, keepers, trades, H2H |

## Project Structure

```
src/
  App.tsx                    — Routes + SportLayout wrapper

  api/
    client.ts                — fetchApi (5-min TTL cache), fetchText, API_URL
    hooks.ts                 — useApiData + domain hooks (all return {data, loading, error})
    types.ts                 — All shared TypeScript types (ScoringMode, etc.)

  components/
    sport/                   — SportLayout, SportPage, SeasonOverview, RankingsSection,
    │                          MatchupsSection, PlayoffBracket, ArticleFeed,
    │                          ArticlesPage, SeasonPicker
    records/                 — RecordsPage, ManagersTab, EntityCard, H2HMatrix
    franchise/               — FranchiseDetailPage, SeasonRoster
    article/                 — ArticlePage, ArticleContent, StatsSidebar
    layout/                  — AppShell
    shared/                  — Card, Stat, SeasonRow, ArticleCard, LoadingSpinner, ErrorBanner

  utils/
    records-helpers.ts       — Pure helpers: winPct, ordinal, getMedals, getFinishGroups
```

## Key Conventions

- **All hooks return `{data, loading, error}`** — no exceptions, no renaming `data`.
- **Shared types go in `api/types.ts`** — never export a type from a component and import it back.
- **Shared utilities go in `utils/`** — if a function is used in two places, extract it first.
- **Scoring mode derived from slug** — `slug === "baseball"` → category mode; otherwise matchup mode. Never expose a toggle for something derivable from context.
- **External image `onError`** — any `<img>` with a dynamic URL needs `onError={(e) => e.currentTarget.style.display='none'}`.
- **Shared components go in `components/shared/`** — any component used in 2+ domains belongs there.
