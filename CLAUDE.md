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
2. Wrap in `<Suspense fallback={<LoadingSpinner />}>` in the route definition
3. Always show `<ErrorBanner message={error} />` when the hook returns an error
4. Always show `<LoadingSpinner />` when loading is true

## Verification Before Commit

```bash
cd web
npx tsc --noEmit
```

Zero TypeScript errors before committing. No exceptions.
